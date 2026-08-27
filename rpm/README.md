# RPM packaging

This directory contains everything needed to package AO Loot Logger as an RPM
and publish it as a signed `dnf`/`yum` repository hosted on GitHub Pages.

## How it fits together

- `ao-loot-logger.spec` packages the already-built Linux tarball (the same
  artifact produced by the `build-linux` job in
  [`.github/workflows/build.yml`](../.github/workflows/build.yml)) as an RPM.
  It doesn't compile anything — it just installs the prebuilt shim executable
  and its bundled Node.js runtime under `/usr/lib64/ao-loot-logger/` and adds
  a small wrapper at `/usr/bin/ao-loot-logger`.
- The bundled native `cap` addon is compiled on Ubuntu (`build-linux` runs on
  `ubuntu-latest`) and links against libpcap's Debian/Ubuntu SONAME,
  `libpcap.so.0.8`. Fedora/RHEL's `libpcap` package ships the same library
  under its own SONAME, `libpcap.so.1` — same ABI, different distro naming
  convention — so the spec adds a private compat symlink
  (`libpcap.so.0.8 -> ../libpcap.so.1`) inside `/usr/lib64/ao-loot-logger/`
  and has the `/usr/bin/ao-loot-logger` wrapper set `LD_LIBRARY_PATH` so it's
  found, without touching anything outside the package's own directory.
- The `build-rpm` job (in `build.yml`) builds and, if a signing key is
  configured, signs the RPM on every push to `main`/`dev`.
- The `publish-rpm-repo` job (in
  [`.github/workflows/release.yml`](../.github/workflows/release.yml)) takes
  the signed RPM from a successful release, adds it to a package pool kept on
  the `gh-pages` branch, regenerates the repo metadata with `createrepo_c`,
  signs `repomd.xml`, and pushes the result. Every released version is kept in
  the pool (nothing is deleted), so users can install or downgrade to any
  published version.

## One-time setup for the maintainer

### 1. Generate a signing key

```console
$ gpg --full-generate-key
```

Pick RSA, at least 4096 bits, and a real passphrase. Use a name/email that
identifies this as the project's release key, e.g.
`AO Loot Logger Releases <you@example.com>`.

### 2. Add the two repository secrets

In **Settings → Secrets and variables → Actions**, add:

- `RPM_SIGNING_KEY` — the ASCII-armored private key:
  ```console
  $ gpg --export-secret-keys --armor <KEY_ID_OR_EMAIL>
  ```
  Paste the full output, including the `-----BEGIN/END PGP PRIVATE KEY
  BLOCK-----` lines, as the secret value.
- `RPM_SIGNING_KEY_PASSPHRASE` — the passphrase you chose above.

Both workflows check for `RPM_SIGNING_KEY` and simply skip signing (publishing
an unsigned repo with `gpgcheck=0`) if it isn't set yet, so none of this
blocks the RPM itself from building and being released.

### 3. Enable GitHub Pages

The `publish-rpm-repo` job only ever touches the `rpm/` subtree of the
`gh-pages` branch, and it will create that branch itself on the first release
if it doesn't exist yet — but the GitHub UI needs the branch to already exist
before you can pick it in **Settings → Pages**. `gh-pages` isn't something a
normal PR can create (it's an unrelated history, not a branch of `main`), so
bootstrap it once yourself from `gh-pages-seed/` (a simple landing page plus
`.nojekyll`, so GitHub doesn't try to run the site through Jekyll):

```console
$ git checkout --orphan gh-pages
$ git rm -rf .
$ git checkout main -- rpm/gh-pages-seed
$ mv rpm/gh-pages-seed/* rpm/gh-pages-seed/.nojekyll .
$ rmdir rpm/gh-pages-seed
$ git add -A
$ git commit -m "chore: bootstrap gh-pages"
$ git push origin gh-pages
$ git checkout main
```

Then in **Settings → Pages**:

- Source: `Deploy from a branch`
- Branch: `gh-pages`, folder `/ (root)`

The repo will then be reachable at
`https://matheussampaio.github.io/ao-loot-logger/rpm/`, and the landing page
at `https://matheussampaio.github.io/ao-loot-logger/`.

## Verifying a signed package/repo locally

```console
$ rpm --import https://matheussampaio.github.io/ao-loot-logger/rpm/RPM-GPG-KEY-ao-loot-logger
$ rpm --checksig ao-loot-logger-*.rpm
$ gpg --verify repomd.xml.asc repomd.xml
```
