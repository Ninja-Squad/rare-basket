pluginManagement {
    plugins {
        id("org.springframework.boot") version "2.7.4"
        id("io.spring.dependency-management") version "1.0.14.RELEASE"
        id("org.flywaydb.flyway") version "8.5.13"
        id("com.github.node-gradle.node") version "3.4.0"
    }
}

rootProject.name = "rare-basket"

include("backend", "frontend")
