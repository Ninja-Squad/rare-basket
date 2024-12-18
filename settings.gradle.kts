pluginManagement {
    plugins {
        id("org.springframework.boot") version "3.4.0"
        id("io.spring.dependency-management") version "1.1.7"
        id("org.flywaydb.flyway") version "11.1.0"
        id("com.github.node-gradle.node") version "7.1.0"
    }
}

rootProject.name = "rare-basket"

include("backend", "frontend")
