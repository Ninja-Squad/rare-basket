pluginManagement {
    plugins {
        id("org.springframework.boot") version "2.6.7"
        id("io.spring.dependency-management") version "1.0.11.RELEASE"
        id("org.flywaydb.flyway") version "8.5.9"
        id("com.github.node-gradle.node") version "3.2.1"
    }
}

rootProject.name = "rare-basket"

include("backend", "frontend")
