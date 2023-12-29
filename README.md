# wid-cli

Various project boilerplate creation and tool scaffolding inspired by [create-next-app](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) and powered by [clack](https://github.com/natemoo-re/clack/tree/main).

## Project creation

### wid new [your-project-name]

```shell
wid new myapp
```

After executing this command, create a [project boilerplate](https://github.com/zhaohuanyuu/boilerplates) according to the prompts. 

If you need to use a custom project boilerplate,project boilerplate, you can specify it through the setting command.

### wid set

- repo [boilerplate-repo-url]

```shell
wid set --repo your-repo-url
```

It must be constrained according to the file structure of the [project boilerplate](https://github.com/zhaohuanyuu/boilerplates). Currently there are only two levels (custom configuration will be added in the future)

### wid reset

```shell
wid reset
```

Reset custom configuration

## other features

In progress...