# platform

Used to obtain the current platform parameters and configuration.

The Platform service can be used to get information about your current device.
You can get all of the platforms associated with the device using the platforms
method, including whether the app is being viewed from a tablet, if it's
on a mobile device or browser, and the exact platform (iOS, Android, etc).
You can also get the orientation of the device, if it uses right-to-left
language direction, and much much more. With this information you can completely
customize your app to fit any device.
 

web相关的平台设置库

- 根据UA匹配环境
- 根据环境执行指定的初始化代码
- 缓存当前平台预设的配置
- 如果URL中有指定配置, 则相应的配置优先级最高

Platform实例数据:

- window
- ua
- setting
- plt: win/mac
- size
- dir
- css

