# Quelplan 的 Tauri 2 自动更新

这份文档按“第一次接触桌面应用发布”的角度，介绍 Quelplan 在 Windows 上如何通过 GitHub Releases 更新。

## 1. 整套系统分别做什么

Quelplan 不是直接把 GitHub 上的源码覆盖到用户电脑。完整过程是：

1. GitHub Actions 在 Windows 云电脑上编译项目。
2. Tauri 生成 MSI、对应的 `.sig` 签名和 `latest.json` 更新清单。
3. `tauri-action` 把这些文件放进 GitHub Release。
4. 已安装的 Quelplan 启动后读取 `latest.json`。
5. Tauri 比较已安装版本和 Release 版本；只有 Release 版本更高时才返回更新。
6. 用户点击“更新”后，应用下载 MSI，并用应用内置的公钥验证 `.sig`。
7. 验证成功后运行 MSI、替换旧版本并重新启动。

更新地址配置为：

```text
https://github.com/Rance-21/Quelplan/releases/latest/download/latest.json
```

因此仓库必须是公开仓库。私有仓库的 Release 文件需要身份认证，不能直接使用这套匿名下载方案。

## 2. 为什么有公钥和私钥

Tauri updater 的签名是为了防止别人替换安装包：

- 私钥负责给每次构建出的 MSI 签名，只能由发布者保管。
- 公钥放在 `src-tauri/tauri.conf.json`，安装给所有用户，用来验证签名。
- 私钥不能提交到 Git，也不能写进 workflow 文件；只放在 GitHub Secrets。
- 如果已经发布过正式版却丢失私钥，旧版客户端将无法验证用新密钥签出的更新。

需要在仓库的 **Settings → Secrets and variables → Actions** 中创建：

```text
TAURI_SIGNING_PRIVATE_KEY
TAURI_SIGNING_PRIVATE_KEY_PASSWORD
```

第一个 Secret 填与当前 `pubkey` 配套的私钥内容，第二个填生成私钥时使用的密码；没有密码时可以不创建第二个 Secret，workflow 会把它当作空字符串。

> Tauri updater 签名和 Windows Authenticode 代码签名不是一回事。updater 签名用于保护自动更新且不可关闭；Windows 代码签名主要用于证明发布者身份并减少 SmartScreen 警告。没有购买 Windows 代码签名证书时 updater 仍能工作，但用户可能看到“未知发布者”。

参考资料：

- [Tauri 2 Updater](https://v2.tauri.app/plugin/updater/)
- [Tauri 的 GitHub 发布流水线](https://v2.tauri.app/distribute/pipelines/github/)
- [tauri-action](https://github.com/tauri-apps/tauri-action)
- [Windows Code Signing](https://v2.tauri.app/distribute/sign/windows/)

## 3. 每次发布前修改版本号

发布前必须保证下面三个文件中的版本完全一致，而且高于已经发布的版本：

```text
package.json
src-tauri/Cargo.toml
src-tauri/tauri.conf.json
```

例如从 `0.1.0` 发布到 `0.2.0`，三个位置都改成 `0.2.0`。版本采用 `主版本.次版本.修订号`：

- 修复小问题：`0.1.0` → `0.1.1`
- 添加兼容的新功能：`0.1.1` → `0.2.0`
- 出现不兼容的大改动：`0.2.0` → `1.0.0`

如果新 Release 仍然是 `0.1.0`，已安装的 `0.1.0` 会认为没有更新。

## 4. 在 GitHub 上发布

项目的 `.github/workflows/publish-windows.yml` 只支持手动触发，不会因为普通 push 自动发布：

1. 提交并推送修改后的版本号和代码。
2. 打开 GitHub 仓库的 **Actions** 页面。
3. 选择 **Publish Windows MSI**。
4. 点击 **Run workflow**。
5. workflow 会安装 pnpm 和 Rust 依赖，执行 Tauri 构建并创建 Draft Release。
6. 打开草稿 Release，确认至少包含 MSI、`.msi.sig` 和 `latest.json`。
7. 填写面向用户的更新说明。
8. 点击 **Publish release**。

草稿不会出现在 `/releases/latest/`，所以不会提前触发客户端更新。只有发布后，正式版应用才能读取新的 `latest.json`。

`latest.json` 大致包含版本号、更新说明、Windows 下载地址和 `.sig` 文件的签名内容。它由 `tauri-action` 自动生成，不需要手写。

## 5. 如何测试

开发模式会跳过真实检查，避免 `pnpm tauri dev` 意外安装线上版本。完整测试需要两个正式版本：

1. 先安装较旧版本，例如 `0.1.0`。
2. 在 GitHub 发布更高版本，例如 `0.1.1`。
3. 启动旧版，确认出现更新窗口。
4. 先测试取消和 SideBar Undo，重启后应再次提示。
5. 再点击更新，确认下载、被动安装和重启成功。
6. 暂时改错签名的测试 Release 必须安装失败并显示 Toast；完成测试后删除错误 Release。

## 6. 常见问题

### 启动后没有更新窗口

- 检查 Release 是否仍是 Draft。
- 检查三个版本号是否已经提高且一致。
- 在浏览器打开 endpoint，确认能下载 `latest.json`。
- 确认 Release 中的 `latest.json` 包含 `windows-x86_64`。
- 开发模式本来就不会检查，必须运行已安装的正式版。

### 显示签名错误

- 检查 GitHub Secret 中是否是当前公钥对应的私钥。
- 不要手动修改 workflow 生成的 MSI 或 `latest.json` 签名内容。
- 每次新构建的 `.sig` 都不同，不能复用旧版本签名。

### Windows 显示未知发布者

这是 Windows 代码签名问题，不是 updater 公私钥失效。早期个人项目可以先接受 SmartScreen 提示，准备正式面向大量用户发布时再购买并配置 Windows 代码签名证书。
