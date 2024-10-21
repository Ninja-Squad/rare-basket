pluginManagement {
    plugins {
        id("org.springframework.boot") version "3.3.4"
        id("io.spring.dependency-management") version "1.1.6"
        id("org.flywaydb.flyway") version "10.20.0"
        id("com.github.node-gradle.node") version "7.1.0"
    }
}

rootProject.name = "rare-basket"

include("backend", "frontend")
