const scanner = require("sonarqube-scanner");

scanner(
    {
        /**
         * this example uses local instance of SQ
         *  This is the URL of SonarQube we started in Docker container
         * */
        serverUrl: "http://localhost:9000/",
        options: {
            /**
             * If project version is not set manually, it will be read from package.json, 
             * but SonarQube team recommends setting it manually.
             */
            //   "sonar.projectVersion": "1.1.0", 
            /**
             * List of sources (*.ts files with code). Preferably it should be one folder, `src`. 
             * This example is prepared for Middleware project.
             */
            // "sonar.sources": ["common", "integration", "ReportService", "routes", "services", "utils", "viewModels"].join(","),
            "sonar.sources": ["src"].join(","),
            "sonar.tests": "test",
            /**
             * If you have test coverage report, you can specify it's path using these options.
             */
            "sonar.typescript.lcov.reportPaths": "./coverage/lcov.info",
            //   "sonar.testExecutionReportPaths": "./coverage/clover.xml" 
            "sonar.coverage.exclusions": "**/*.spec.ts"
        },
    },
    () => {
        // callback is required
    }
);
