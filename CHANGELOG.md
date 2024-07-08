# Changelog

This file was generated using [@jscutlery/semver](https://github.com/jscutlery/semver).

## [2.2.5](https://github.com/WeTransfer/adtech-monorepo/compare/frame-events-api@2.2.4...frame-events-api@2.2.5) (2024-05-15)



## [2.2.4](https://github.com/WeTransfer/adtech-monorepo/compare/frame-events-api@2.2.3...frame-events-api@2.2.4) (2024-04-24)



## [2.2.3](https://github.com/WeTransfer/adtech-monorepo/compare/frame-events-api@2.2.2...frame-events-api@2.2.3) (2024-04-10)



## [2.2.2](https://github.com/WeTransfer/adtech-monorepo/compare/frame-events-api@2.2.1...frame-events-api@2.2.2) (2024-03-19)



## [2.2.1](https://github.com/WeTransfer/adtech-monorepo/compare/frame-events-api@2.2.0...frame-events-api@2.2.1) (2024-03-13)


### Bug Fixes

* **desktop-web-renderer:** send action API method ([#935](https://github.com/WeTransfer/adtech-monorepo/issues/935)) ([8f339f3](https://github.com/WeTransfer/adtech-monorepo/commit/8f339f3026d703f530f9c49ab1643063ea624c52))



# [2.2.0](https://github.com/WeTransfer/adtech-monorepo/compare/frame-events-api@2.1.2...frame-events-api@2.2.0) (2024-03-05)


### Features

* **frame-events-api:** clone third-party script inline content ([#916](https://github.com/WeTransfer/adtech-monorepo/issues/916)) ([c524b7b](https://github.com/WeTransfer/adtech-monorepo/commit/c524b7b75308f74e304ef9f237c278f38d63ddf8))



## [2.1.2](https://github.com/WeTransfer/adtech-monorepo/compare/frame-events-api@2.1.1...frame-events-api@2.1.2) (2024-02-29)



## [2.1.1](https://github.com/WeTransfer/adtech-monorepo/compare/frame-events-api@2.1.0...frame-events-api@2.1.1) (2023-12-07)

# [2.1.0](https://github.com/WeTransfer/adtech-monorepo/compare/frame-events-api@2.0.6...frame-events-api@2.1.0) (2023-10-09)

### Features

- **frame-events-api:** new event emitter helper ([#789](https://github.com/WeTransfer/adtech-monorepo/issues/789)) ([b01ee2b](https://github.com/WeTransfer/adtech-monorepo/commit/b01ee2ba91d1b92424588e2979c30b7c6f1cf075))

## [2.0.6](https://github.com/WeTransfer/adtech-monorepo/compare/frame-events-api@2.0.5...frame-events-api@2.0.6) (2023-05-04)

## [2.0.5](https://github.com/WeTransfer/adtech-monorepo/compare/frame-events-api@2.0.4...frame-events-api@2.0.5) (2023-05-01)

## [2.0.4](https://github.com/WeTransfer/adtech-monorepo/compare/frame-events-api@2.0.3...frame-events-api@2.0.4) (2023-04-25)

## [2.0.3](https://github.com/WeTransfer/adtech-monorepo/compare/frame-events-api@2.0.2...frame-events-api@2.0.3) (2023-04-12)

## [2.0.2](https://github.com/WeTransfer/adtech-monorepo/compare/frame-events-api@2.0.1...frame-events-api@2.0.2) (2023-04-12)

### Bug Fixes

- **ad-sdk:** update parent api state ([#552](https://github.com/WeTransfer/adtech-monorepo/issues/552)) ([975891d](https://github.com/WeTransfer/adtech-monorepo/commit/975891db5ed7e9cf022214d6022b3c5ebdedf458))

## [2.0.1](https://github.com/WeTransfer/adtech-monorepo/compare/frame-events-api@2.0.0...frame-events-api@2.0.1) (2023-03-30)

# [2.0.0](https://github.com/WeTransfer/adtech-monorepo/compare/frame-events-api@1.1.0...frame-events-api@2.0.0) (2023-01-24)

- [ADT-745]: upgrade nx (#440) ([bc2ef3a](https://github.com/WeTransfer/adtech-monorepo/commit/bc2ef3accd24f723a3316a795e2b62bc903bb618)), closes [#440](https://github.com/WeTransfer/adtech-monorepo/issues/440) [#ADT-745](https://github.com/WeTransfer/adtech-monorepo/issues/ADT-745) [#ADT-745](https://github.com/WeTransfer/adtech-monorepo/issues/ADT-745)

### BREAKING CHANGES

- wallpaper.unmount is not supported anymore

- upgrade packages (fix ReactCSSTransition error with react 18)

- specify node version via nvmrc

- align version with transfer FE - needed for rewire-ts

- downgrade react to keep being compatible with FE

- nvm file conflicts with husky, revert node setup

- update @jscutlery/semver

- use lts/fermium to support rewire

- review - remove test inclusion

- cast wallpaper for ts compilation

- fix import.media.url outside of module with publicPath

- removed unneeded packages - added by @nrwl/web

# [1.1.0](https://github.com/WeTransfer/adtech-monorepo/compare/frame-events-api@1.0.0...frame-events-api@1.1.0) (2023-01-04)

### Features

- **mobile-web:** request new ad ([#435](https://github.com/WeTransfer/adtech-monorepo/issues/435)) ([ab048ef](https://github.com/WeTransfer/adtech-monorepo/commit/ab048efeb0868b610915bc1fcb24a4d49cf3f43a))

# 1.0.0 (2022-12-13)

### Features

- **frame-events-api:** enable several placements per app ([#389](https://github.com/WeTransfer/adtech-monorepo/issues/389)) ([a22568b](https://github.com/WeTransfer/adtech-monorepo/commit/a22568bd17bba5a49ee7aa91c0d05438d8138522))
- **frame-events-api:** rename-padre-y-marco clean ([#376](https://github.com/WeTransfer/adtech-monorepo/issues/376)) ([57c2486](https://github.com/WeTransfer/adtech-monorepo/commit/57c248609f595be61b49d6f9ebb36a0130ba985e))

### BREAKING CHANGES

- **frame-events-api:** Frames must agree on a placement name

- Use query parameters to define placement

- Docs and cleanup
