pluginManagement {
    plugins {
        id("org.springframework.boot") version "2.2.5.RELEASE"
        id("io.spring.dependency-management") version "1.0.8.RELEASE"
        id("org.flywaydb.flyway") version "6.1.4"
        id("com.github.node-gradle.node") version "2.2.3"
    }
}

rootProject.name = "rare-basket"

include("backend", "frontend")
