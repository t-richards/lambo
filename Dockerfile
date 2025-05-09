# Builder image
FROM ruby:3.4.2-alpine AS builder

ENV RAILS_ENV=production
ENV BUNDLER_VERSION=2.6.7
ENV BUNDLE_DEPLOYMENT=true
ENV BUNDLE_WITHOUT=development:test
ENV BUNDLE_JOBS=3
ENV BUNDLE_RETRY=3
ENV SECRET_KEY_BASE_DUMMY=1
WORKDIR /app

# System-level build dependencies
RUN apk add --no-cache --update alpine-sdk npm sqlite-dev tzdata yaml-dev
RUN gem install bundler -v $BUNDLER_VERSION

# App deps
COPY Gemfile* /app/
RUN bundle config build.sqlite3 --enable-system-libraries
RUN bundle install

# Remove some things that cleanup_vendor doesn't get yet
RUN cd vendor/bundle/ruby/3.4.0; \
  rm -rf cache; \
  rm -rf gems/*/ext; \
  rm -rf gems/lib/*/*.so; \
  rm -rf extensions/*/*/*/mkmf.log; \
  rm -rf extensions/*/*/*/gem_make.out

# Build assets
COPY . /app/
RUN npm ci
RUN bin/rails assets:precompile
RUN bin/cleanup_vendor
RUN rm -f /app/bin/cleanup_vendor
RUN rm -f /app/package.json /app/package-lock.json
RUN rm -rf /app/app/assets/builds/*
RUN rm -rf /app/log/*
RUN rm -rf /app/tmp/*
RUN rm -rf /app/node_modules
RUN rm -rf /app/vendor/assets

# Runner image
FROM ruby:3.4.2-alpine AS prod

ENV RAILS_ENV=production
ENV BUNDLER_VERSION=2.6.7
ENV BUNDLE_WITHOUT=development:test
ENV BUNDLE_PATH=vendor/bundle
WORKDIR /app

# Add app
COPY --from=builder /app /app

RUN set -eux; \
# Runtime dependencies
	apk add --no-cache --update curl ca-certificates jemalloc patchelf sqlite-libs tzdata yaml; \
# Patch ruby binary to use jemalloc without LD_PRELOAD
	patchelf --add-needed libjemalloc.so.2 /usr/local/bin/ruby; \
	apk del patchelf; \
# Install bundler
	gem install bundler -v $BUNDLER_VERSION; \
	rm -rf /root/.gem; \
# Verify deps
	bundle check; \
# Pre-populate bootsnap cache
	bundle exec bootsnap precompile --gemfile app/ lib/; \
	rm -f log/*; \
# Add unprivileged user and allow it to write to tmp
	adduser --disabled-password app; \
	chown -R app:app tmp

EXPOSE 3000
USER app
ENTRYPOINT ["/app/bin/rails"]
CMD ["server"]
