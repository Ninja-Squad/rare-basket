import com.github.gradle.node.yarn.task.YarnTask

plugins {
    base
    id("com.github.node-gradle.node")
}

node {
    version.set("14.17.0")
    npmVersion.set("6.14.10")
    yarnVersion.set("1.22.10")
    download.set(true)
}

tasks {
    npmInstall {
        enabled = false
    }

    val yarn_install by getting {
        inputs.file("package.json")
        inputs.file("yarn.lock")
        outputs.dir("node_modules")
    }

    val prepare by registering {
        dependsOn(yarn_install)
    }

    val yarn_build by getting {
        dependsOn(prepare)
        inputs.dir("src")
        outputs.dir("dist")
    }

    val yarn_test by getting {
        dependsOn(prepare)
        inputs.dir("src")
        outputs.dir("coverage")
    }

    val test by registering {
        dependsOn(yarn_test)
    }

    val yarn_lint by getting {
        dependsOn(prepare)
        inputs.dir("src")
        inputs.file("tslint.json")
        outputs.file("tslint-result.txt")
    }

    val lint by registering {
        dependsOn("yarn_lint")
        doLast {
            file("tslint-result.txt").useLines { sequence ->
                if (sequence.any { it.contains("WARNING") }) {
                    throw GradleException("Lint warning found. Check tslint-result.txt")
                }
            }
        }
    }

    // This is not a yarn_format task because the task to run is `yarn format:check`
    // and tasks with colons are not supported
    val checkFormat by registering(YarnTask::class) {
        args.set(listOf("run", "format:check"))
        ignoreExitValue.set(true)
        dependsOn(prepare)
        inputs.dir("src")
        inputs.file(".prettierrc")
        outputs.file("prettier-result.txt")
        doLast {
            file("prettier-result.txt").useLines { sequence ->
                if (sequence.any { it.contains("src") }) {
                    throw GradleException ("Formatting warning found. Check prettier-result.txt")
                }
            }
        }
    }

    check {
        dependsOn(checkFormat)
        dependsOn(lint)
        dependsOn(test)
    }

    assemble {
        dependsOn(yarn_build)
    }

    clean {
        dependsOn("cleanYarn_build")
        dependsOn("cleanYarn_test")
        dependsOn("cleanYarn_lint")
    }
}
