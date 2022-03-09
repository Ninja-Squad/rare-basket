import com.github.gradle.node.yarn.task.YarnInstallTask
import com.github.gradle.node.yarn.task.YarnTask

plugins {
    base
    id("com.github.node-gradle.node") version "3.0.1"
}

node {
    version.set("16.14.0")
    npmVersion.set("6.14.16")
    yarnVersion.set("1.22.17")
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

    val yarnLint by registering(YarnTask::class){
        args.set(listOf("lint"))
        dependsOn(prepare)
        inputs.dir("src")
        inputs.file(".eslintrc.json")
        inputs.file(".prettierrc")
        outputs.file("$buildDir/eslint-result.txt")
    }

    val lint by registering {
        dependsOn(yarnLint)
    }

    val test by registering {
        dependsOn(yarnTest)
    }

    check {
        dependsOn(lint)
        dependsOn(test)
    }

    assemble {
        dependsOn(yarnBuild)
    }

    val clean by getting {
        dependsOn("cleanYarnBuild")
        dependsOn("cleanYarnTest")
    }
}
