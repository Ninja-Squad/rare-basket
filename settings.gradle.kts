pluginManagement {
    plugins {
        id("org.springframework.boot") version "2.5.1"
        id("io.spring.dependency-management") version "1.0.11.RELEASE"
        id("org.flywaydb.flyway") version "7.7.3"
        id("com.github.node-gradle.node") version "3.0.1"
    }
}

rootProject.name = "rare-basket"

include("backend", "frontend")
