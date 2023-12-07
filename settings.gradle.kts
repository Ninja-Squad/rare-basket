pluginManagement {
    plugins {
        id("org.springframework.boot") version "3.2.0"
        id("io.spring.dependency-management") version "1.1.4"
        id("org.flywaydb.flyway") version "10.2.0"
        id("com.github.node-gradle.node") version "7.0.1"
    }
}

rootProject.name = "rare-basket"

include("backend", "frontend")
