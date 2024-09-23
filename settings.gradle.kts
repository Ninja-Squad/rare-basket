pluginManagement {
    plugins {
        id("org.springframework.boot") version "3.3.4"
        id("io.spring.dependency-management") version "1.1.6"
        id("org.flywaydb.flyway") version "10.18.0"
        id("com.github.node-gradle.node") version "7.0.2"
    }
}

rootProject.name = "rare-basket"

include("backend", "frontend")
