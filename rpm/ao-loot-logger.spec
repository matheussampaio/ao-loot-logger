# The Source0 tarball is produced by `npx package` (see .github/workflows/build.yml,
# job build-linux) and already contains a prebuilt, self-contained application:
# a shim executable plus a copied Node.js binary and production node_modules
# (including the native `cap` addon linked against libpcap). rpmbuild only
# repackages these prebuilt artifacts, it does not compile anything, so the
# usual automatic dependency/provides scanning and stripping are disabled for
# the payload directory below.
%global debug_package %{nil}
%global __os_install_post %{nil}
%global __requires_exclude_from ^%{_libdir}/%{name}/.*$
%global __provides_exclude_from ^%{_libdir}/%{name}/.*$

Name:           ao-loot-logger
Version:        %{?app_version}%{!?app_version:0.0.0}
Release:        1%{?dist}
Summary:        Logs loot grabbed by other players in Albion Online

License:        GPL-3.0-only
URL:            https://github.com/matheussampaio/ao-loot-logger
Source0:        ao-loot-logger-linux.tar.gz
Source1:        LICENSE

ExclusiveArch:  x86_64
Requires:       libpcap

%description
AO Loot Logger writes all the loot grabbed by other players in Albion
Online to a file, which can then be analyzed with Loot Logger Viewer
(https://matheus.sampaio.us/ao-loot-logger-viewer).

%prep
%setup -q -c -T -a 0
cp %{SOURCE1} .

%install
rm -rf %{buildroot}
install -d %{buildroot}%{_libdir}/%{name}
cp -a ao-loot-logger/. %{buildroot}%{_libdir}/%{name}/

# The bundled cap.node was compiled on Ubuntu (build-linux runs on
# ubuntu-latest) and is linked against libpcap's Debian/Ubuntu SONAME,
# libpcap.so.0.8 - Fedora/RHEL's libpcap package ships the same library
# under its own SONAME, libpcap.so.1, so that exact filename never exists
# here and the binary fails to load it. The two are ABI-compatible (same
# upstream libpcap major version, just a distro naming difference), so a
# private compat symlink resolved via LD_LIBRARY_PATH (see the wrapper
# below) is enough - no need to touch anything outside our own directory.
ln -s ../libpcap.so.1 %{buildroot}%{_libdir}/%{name}/libpcap.so.0.8

install -d %{buildroot}%{_bindir}
cat > %{buildroot}%{_bindir}/%{name} <<EOF
#!/bin/sh
export LD_LIBRARY_PATH="%{_libdir}/%{name}\${LD_LIBRARY_PATH:+:\$LD_LIBRARY_PATH}"
exec %{_libdir}/%{name}/%{name} "\$@"
EOF
chmod 0755 %{buildroot}%{_bindir}/%{name}

%files
%license LICENSE
%{_bindir}/%{name}
%{_libdir}/%{name}/
