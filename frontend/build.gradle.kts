import com.github.gradle.node.pnpm.task.PnpmInstallTask
import com.github.gradle.node.pnpm.task.PnpmTask

plugins {
    base
    id("com.github.node-gradle.node") version "7.1.0"
}

node {
    version.set("20.12.2")
    npmVersion.set("10.5.0")
    download.set(true)
}

tasks {
    npmInstall {
        enabled = false
    }

    named<PnpmInstallTask>(PnpmInstallTask.NAME) {
        ignoreExitValue.set(true)
    }

    val prepare by registering {
        dependsOn(PnpmInstallTask.NAME)
    }

    val pnpmBuild by registering(PnpmTask::class) {
        args.set(listOf("build"))
        dependsOn(prepare)
        inputs.dir("src")
        outputs.dir("dist")
    }

    val pnpmTest by registering(PnpmTask::class) {
        args.set(listOf("test"))
        dependsOn(prepare)
        inputs.dir("src")
        outputs.dir("coverage")
    }

    val pnpmE2e by registering(PnpmTask::class) {
        args.set(listOf("e2e"))
        dependsOn(prepare)
        inputs.dir("src")
        outputs.dir("playwright-report")
    }

    val pnpmLint by registering(PnpmTask::class){
        args.set(listOf("lint"))
        dependsOn(prepare)
        inputs.dir("src")
        inputs.file("eslint.config.js")
        inputs.file(".prettierrc")
        outputs.file(layout.buildDirectory.file("eslint-result.txt"))
    }

    val lint by registering {
        dependsOn(pnpmLint)
    }

    val test by registering {
        dependsOn(pnpmTest)
    }

    val e2e by registering {
        dependsOn(pnpmE2e)
    }

    check {
        dependsOn(lint)
        dependsOn(test)
        dependsOn(e2e)
    }

    assemble {
        dependsOn(pnpmBuild)
    }

    val clean by getting {
        dependsOn("cleanPnpmBuild")
        dependsOn("cleanPnpmTest")
        dependsOn("cleanPnpmE2e")
    }
}
