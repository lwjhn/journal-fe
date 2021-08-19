import Launcher from '@rongji/launcher';
import src from '../src/index.js';
import user from '@rongji/user';
// ...其他业务模块的import
// 创建启动器，传入各业务模块
const launcher = new Launcher(
    [
        user,
        // ...其他业务模块
        src
    ]
);
// 启动
launcher.start();
