@echo off
setlocal
set "JAVA_HOME=%~dp0.tools\jdk-21.0.13+9"
set "PATH=%JAVA_HOME%\bin;%~dp0.tools\apache-maven-3.9.6\bin;%PATH%"

echo ========================================================
echo Starting FarmVerse Nexus - Equipment Operations Backend
echo Port: 8080
echo Swagger: http://localhost:8080/swagger-ui.html
echo ========================================================

java -jar "%~dp0backend\target\farmverse-equipment-1.0.0.jar"

