#!/usr/bin/env sh
DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -d "$DIR/.tools/jdk-21.0.13+9" ]; then
    export JAVA_HOME="$DIR/.tools/jdk-21.0.13+9"
    export PATH="$JAVA_HOME/bin:$DIR/.tools/apache-maven-3.9.6/bin:$PATH"
    exec "$DIR/.tools/apache-maven-3.9.6/bin/mvn" "$@"
elif [ -d "$DIR/../.tools/jdk-21.0.13+9" ]; then
    export JAVA_HOME="$DIR/../.tools/jdk-21.0.13+9"
    export PATH="$JAVA_HOME/bin:$DIR/../.tools/apache-maven-3.9.6/bin:$PATH"
    exec "$DIR/../.tools/apache-maven-3.9.6/bin/mvn" "$@"
else
    exec mvn "$@"
fi

