# Windows desktop installer

The Windows installer is built by the `Windows desktop installer` GitHub Actions workflow on `windows-latest` from the `windows-installer-builder` frontend branch and the backend `master` source branch. The workflow builds the backend JAR instead of using the older JAR committed under `desktop-resources`, then creates a Java 22 Windows x64 runtime with `jlink`, builds the React app and NSIS installer, and uploads the `.exe` as the `SEV-Grandson-Inventory-Windows-x64` artifact.

The backend source is configured for Java 22 (`pom.xml`) and its datasource uses:

`jdbc:h2:file:${INVENTORY_DB_DIR:./inventory_data}/inventary_management_system;DB_CLOSE_ON_EXIT=FALSE`

It binds to `127.0.0.1:8080`; the launcher polls the controller's actual health mapping, `http://127.0.0.1:8080/inventarymanagement/testServer`. The desktop launcher creates the data folder before starting Spring Boot and sets `INVENTORY_DB_DIR` to `%LOCALAPPDATA%\SEV Grandson Inventory\inventory_data` (with a per-user Local AppData fallback). The database is outside the install directory and is not removed by the NSIS uninstaller.

To build locally on Windows, build the backend with Java 22, copy the resulting `target/inventarymanagementsystemlatest-0.0.1-SNAPSHOT.jar` to `desktop-resources/backend/app.jar`, create `desktop-resources/jre` as a compatible Windows runtime, then run `npm ci` and `npm run dist:win`. For release builds, use the workflow so the backend JAR and runtime are built and validated consistently. `npm run desktop` builds and launches the frontend locally; local development requires Java unless a runtime is supplied.

React navigation uses `HashRouter`, preserving the existing routes (`/`, `/currentstocks`, `/stockoutflow`, `/stockinflow`, `/addnewproduct`, `/transactions`, and `/serverdown`) while making navigation work from packaged `file://` pages.
