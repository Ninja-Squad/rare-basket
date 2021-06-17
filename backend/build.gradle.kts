import org.flywaydb.gradle.task.FlywayCleanTask

buildscript {
    repositories {
        mavenCentral()
    }

    dependencies {
        classpath("org.postgresql:postgresql:42.2.19")
    }
}

plugins {
    java
    jacoco
    id("org.springframework.boot")
    id("io.spring.dependency-management")
    id("org.flywaydb.flyway")
}

java {
    sourceCompatibility = JavaVersion.VERSION_11
}

repositories {
    mavenCentral()

    // TODO remove this once spring-boot depends on version 5.5.1 or later
    //   it's necessary because version 5.5.0 has the issue https://github.com/spring-projects/spring-security/issues/9794
    //   which breaks the keycloak adapter
    maven {
        url = uri("https://repo.spring.io/snapshot")
    }
}

tasks {
    bootJar {
        archiveFileName.set("rare-basket.jar")
        dependsOn(":frontend:assemble")

        bootInf {
            into("classes/static") {
                from("${project(":frontend").projectDir}/dist/rare-basket-frontend")
            }
        }
        launchScript()
    }

    test {
        useJUnitPlatform()
        // On CI, Gitlab will spin a Postgres service on host "postgres"
        if (System.getenv("CI") != null) {
            systemProperty("rare-basket.database.host-and-port", "postgres:5432")
        }
    }

    jacocoTestReport {
        reports {
            html.required.set(true)
        }
    }

    // disable default tasks added by flyway plugin
    matching { it.name.startsWith("flyway") }.forEach { it.enabled = false }

    val flywayCleanApp by creating(FlywayCleanTask::class) {
        url = "jdbc:postgresql://localhost:5432/rarebasket"
    }
    val flywayCleanTest by creating(FlywayCleanTask::class) {
        url = "jdbc:postgresql://localhost:5432/rarebasket_test"
    }

    listOf(flywayCleanApp, flywayCleanTest).forEach {
        it.apply {
            user = "rarebasket"
            password = "rarebasket"
            (this as DefaultTask).group = "Database"
        }
    }
}

// TODO remove this once spring-boot depends on version 5.5.1 or later
//   it's necessary because version 5.5.0 has the issue https://github.com/spring-projects/spring-security/issues/9794
//   which breaks the keycloak adapter
extra["spring-security.version"] = "5.5.1-SNAPSHOT"

dependencyManagement {
    imports {
        mavenBom("org.keycloak.bom:keycloak-adapter-bom:13.0.1")
        mavenBom("org.springframework.cloud:spring-cloud-dependencies:2020.0.3")
    }
}

dependencies {
    val itextVersion = "7.1.10"

    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-mail")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.cloud:spring-cloud-starter-config")
    implementation("com.samskivert:jmustache")
    implementation("org.keycloak:keycloak-spring-boot-starter")
    implementation("com.itextpdf:kernel:$itextVersion")
    implementation("com.itextpdf:io:$itextVersion")
    implementation("com.itextpdf:layout:$itextVersion")
    implementation("net.sf.supercsv:super-csv:2.4.0")

    runtimeOnly("org.postgresql:postgresql")
    runtimeOnly("org.flywaydb:flyway-core")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")

    testImplementation("com.ninja-squad:DbSetup:2.1.0")
}
