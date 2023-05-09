# CHANGELOG

## v6.1.0 - 2023.05.09 16
* fix break code
* rename environment variable `NENV_HADES_FLAGS` from `NENV_HADES_OPTIONS`


## v6.0.0 - 2023.05.09 15
* use `Error.cause` to support output error chains
* new `ErrorCause` and `ErrorData` methods to be compatible with `Error.cause`
* bump up `@nuogz/i18n` to `v3.x` and renew related code
* add `d.ts` and renew related code
* bump up dependencies


## v5.2.0 - 2022.09.02 17
* rename environment variable `NENV_HADES_NAME` from `HADES_NAME`
* rename environment variable `NENV_HADES_LEVEL` from `HADES_DIR`
* rename environment variable `NENV_HADES_DIR` from `HADES_DIR`
* rename environment variable `NENV_HADES_OPTIONS` from `HADES_DIR`


## v5.1.0 - 2022.09.02 16
* resupport environment variable `HADES_NAME`
* rename environment variable `HADES_DIR` from `HADES_DIR_LOG`
* tweak project configs
* bump up dependencies


## v5.0.5 - 2022.08.12 10
* improve `locale` keys and translations
* bump up `@nuogz/i18n` to `1.2.0` and update related code


## v5.0.3 - 2022.08.09 15
* improve usage of i18n
* remove `localesSupport`
* improve `FileAppender.OptionHandleTypeError`


## v5.0.2 - 2022.08.09 08
* update repository url
* bump up `@nuogz/i18n` to `1.0.2`
* use unified `.eslintrc.cjs` from `@nuogz/pangu`
* use unified `.vscode/launch.json` from `@nuogz/pangu`


## v5.0.1 - 2022.08.08 20
* add `file` and `repository` option into `package.json`
* tweak `.eslintrc.cjs`


## v5.0.0 - 2022.08.08 19
* tweak all files for publishing to npm
* start use `CHANGLOG.md` since version `v5.0.0`
* use library `@nuogz/i18n` instead inline i18n code
* translate all inline documents info english
* bump up `chalk` to `v5.x`
