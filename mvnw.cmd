@echo off
setlocal
set "DIR=%~dp0"
if exist "%DIR%\.tools\jdk-21.0.13+9" (
    set "JAVA_HOME=%DIR%\.tools\jdk-21.0.13+9"
    set "PATH=%DIR%\.tools\jdk-21.0.13+9\bin;%DIR%\.tools\apache-maven-3.9.6\bin;%PATH%"
    call "%DIR%\.tools\apache-maven-3.9.6\bin\mvn.cmd" %*
) else if exist "%DIR%\..\.tools\jdk-21.0.13+9" (
    set "JAVA_HOME=%DIR%\..\.tools\jdk-21.0.13+9"
    set "PATH=%DIR%\..\.tools\jdk-21.0.13+9\bin;%DIR%\..\.tools\apache-maven-3.9.6\bin;%PATH%"
    call "%DIR%\..\.tools\apache-maven-3.9.6\bin\mvn.cmd" %*
) else (
    mvn %*
)

