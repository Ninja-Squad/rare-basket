import org.flywaydb.gradle.task.FlywayCleanTask

buildscript {
    repositories {
        mavenCentral()
    }

    dependencies {
        classpath("org.postgresql:postgresql:42.2.12")
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

dependencyManagement {
    imports {
        mavenBom("org.keycloak.bom:keycloak-adapter-bom:9.0.2")
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

    testImplementation("org.springframework.boot:spring-boot-starter-test") {
        exclude(group = "org.junit.vintage", module = "junit-vintage-engine")
    }
    testImplementation("org.springframework.security:spring-security-test")

    testImplementation("com.ninja-squad:DbSetup:2.1.0")
    testImplementation("org.junit.jupiter:junit-jupiter")
}
