# resource-minifier
EMP resource file minifier

## 命令行使用
1. 安装nodejs
2. 全局安装脚本：`sudo npm install -g RYTong/resource-minifier`
3. `minify -h`
```
EMP resource dev file minifier.
 -h --help  Display help information.
 -f --from=[src]  Speicify source zip file or directory to be minified.
 -t --to=[dest]  Optional, speicify target directory where minified output in.
 -v --version  Display current version.
```

### 压缩文件夹下的资源文件
```sh
minify -f resource_dev.0 -t resdev-min
```
此时，会将`resource_dev.0`目录下的资源文件压缩到当前路径的`resdev-min`目录。如果不指定`-t`参数，则会生成到当前路径的`resource_dev.0-min`目录。

### 压缩zip资源文件
```sh
minify -f resource_dev.zip -t resdev-min
```
此时，会将`resource_dev.zip`压缩包中的资源文件进行压缩，并生成到`resdev-min`目录下。

## API使用
可以作为node模块来使用其导出的API函数。
```javascript
var minifier = require('resource-minifier');

minifier.minify('path/to/srcdir');
minifier.minify('path/to/srcdir', 'path/to/destdir');
minifier.minify('path/to/zipfile.zip');
minifier.minify('path/to/zipfile.zip', 'path/to/destdir');

minifier.minifyCSS('.classA {  border:  #FFFFFF; }');
// '.classA{color:#FFFFFF;}'
minifier.minifyLUA(luaString);
minifier.minifyHTML(htmlString);
```
