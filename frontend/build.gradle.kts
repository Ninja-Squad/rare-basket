import com.github.gradle.node.yarn.task.YarnInstallTask
import com.github.gradle.node.yarn.task.YarnTask

plugins {
    base
    id("com.github.node-gradle.node") version "7.0.2"
}

node {
    version.set("20.12.2")
    npmVersion.set("10.5.0")
    yarnVersion.set("1.22.19")
    download.set(true)
}

tasks {
    npmInstall {
        enabled = false
    }

    named<YarnInstallTask>(YarnInstallTask.NAME) {
        ignoreExitValue.set(true)
    }

    val prepare by registering {
        dependsOn(YarnInstallTask.NAME)
    }

    val yarnBuild by registering(YarnTask::class) {
        args.set(listOf("build"))
        dependsOn(prepare)
        inputs.dir("src")
        outputs.dir("dist")
    }

    val yarnTest by registering(YarnTask::class) {
        args.set(listOf("test"))
        dependsOn(prepare)
        inputs.dir("src")
        outputs.dir("coverage")
    }

    val yarnE2e by registering(YarnTask::class) {
        args.set(listOf("e2e"))
        dependsOn(prepare)
        inputs.dir("src")
        outputs.dir("playwright-report")
    }

    val yarnLint by registering(YarnTask::class){
        args.set(listOf("lint"))
        dependsOn(prepare)
        inputs.dir("src")
        inputs.file(".eslintrc.json")
        inputs.file(".prettierrc")
        outputs.file(layout.buildDirectory.file("eslint-result.txt"))
    }

    val lint by registering {
        dependsOn(yarnLint)
    }

    val test by registering {
        dependsOn(yarnTest)
    }

    val e2e by registering {
        dependsOn(yarnE2e)
    }

    check {
        dependsOn(lint)
        dependsOn(test)
        dependsOn(e2e)
    }

    assemble {
        dependsOn(yarnBuild)
    }

    val clean by getting {
        dependsOn("cleanYarnBuild")
        dependsOn("cleanYarnTest")
        dependsOn("cleanYarnE2e")
    }
}
