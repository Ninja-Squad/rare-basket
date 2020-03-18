import org.flywaydb.gradle.task.FlywayCleanTask

buildscript {
    repositories {
        mavenCentral()
    }

    dependencies {
        classpath("org.postgresql:postgresql:42.2.9")
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
    sourceCompatibility = JavaVersion.VERSION_1_8
}

repositories {
    mavenCentral()
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
    }

    test {
        useJUnitPlatform()
    }

    jacocoTestReport {
        reports {
            html.setEnabled(true)
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

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")

    runtimeOnly("org.postgresql:postgresql")
    runtimeOnly("org.flywaydb:flyway-core")

    testImplementation("org.springframework.boot:spring-boot-starter-test") {
        exclude(group = "org.junit.vintage", module = "junit-vintage-engine")
    }

    testImplementation("com.ninja-squad:DbSetup:2.1.0")
    testImplementation("org.junit.jupiter:junit-jupiter")
}
