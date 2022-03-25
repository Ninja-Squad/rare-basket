pluginManagement {
    plugins {
        id("org.springframework.boot") version "2.6.5"
        id("io.spring.dependency-management") version "1.0.11.RELEASE"
        id("org.flywaydb.flyway") version "8.0.5"
        id("com.github.node-gradle.node") version "3.2.1"
    }
}

rootProject.name = "rare-basket"

include("backend", "frontend")
