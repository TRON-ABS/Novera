# fix(release): pin canonical CLI verification identity

The public bytes/signature verification passed for all 20 assets and eight signed channels in run 42364204595. Its subsequent native CLI check selected the legacy `jan` archive layout because the reviewed descriptor omitted the canonical identity format and compilation commit. Add format 2 and the exact existing CLI source commit from the signed package descriptors. No package, application or updater-feed bytes change.

The failed native check remains recorded rather than counted as successful. Rerun complete public verification and the three-host canonical CLI checks with the corrected metadata. Keep the legacy `latest-cli.json` feed unchanged. Windows installed Desktop availability has separately passed anonymous bytes/signature checks; the maintainer reports a successful Desktop update.
