#!/bin/sh

release=false
buildHTML=true

build_html() {
    ./_make.bat html
}

make_release() {
    release_version=$1
    release_path="release/build-$release_version"
    echo "Making release:  $release_version, release path: $release_path"
    mkdir -p $release_path
    cp -r "build/html" $release_path
}

while getopts 'vbr' option; do
    case "${option}" in
        r) release=true;;
        v) verbose=true ;;
        b) buildHTML=true ;;
    esac
done

cd $1

release_version=`cat ./source/VERSION`

if [ "$buildHTML" = true ] ; then
    build_html $project
    if [ "$release" = true ] ; then
        make_release $release_version
    fi
fi
