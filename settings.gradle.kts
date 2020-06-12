pluginManagement {
    plugins {
        id("org.springframework.boot") version "2.3.1.RELEASE"
        id("io.spring.dependency-management") version "1.0.9.RELEASE"
        id("org.flywaydb.flyway") version "6.4.4"
        id("com.github.node-gradle.node") version "2.2.4"
    }
}

rootProject.name = "rare-basket"

include("backend", "frontend")
