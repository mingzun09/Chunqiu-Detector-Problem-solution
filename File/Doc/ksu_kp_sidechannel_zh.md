KernelSU检测原理：

KernelSU框架会使用Kprobe来hook newfsatat和faccessat系统调用接口，这使得调用两者所花费时间显著变长，但statx不受影响，而且在正常情况下，newfsatat和statx所花时间非常接近。
检测方法：多次测量调用newfsatat和statx所花费的时间，取其总和来让比值趋于稳定，两者所花总时间的比值大于1.2时则判定存在KernelSU。

APatch检测原理：

建议参照[此代码](https://github.com/bmax121/KernelPatch/blob/352de3747693d403eb1a4bd2c98dc04aeb01955a/kernel/patch/common/supercall.c)阅读

APatch管理器在向kernelpatch框架发起鉴权请求时，kernelpatch会读取APatch管理器所提供的superkey的所在地址（从before函数的udata参数传入）；kernelpatch在鉴权前会验证cmd值是否在范围内，在此范围内则允许鉴权，反之不允许。

检测方法：

1. “懒分配”页探测

检测器先向系统申请一个“懒分配”页，将此“懒分配”页的所在地址当作superkey所在地址向kernelpatch发起鉴权请求，kernelpatch会解引用此地址，尝试从中读取所谓的“superkey”，但实际上“懒分配”页中不存在于superkey，而由于kernelpatch尝试读取该页，系统会自动将“懒分配”页映射到一个物理内存块，此时检测器检查此页是否被映射到物理内存块，如果被映射即可判定存在kernelpatch，反之说明kernelpatch不存在。

2. 鉴权时延探测

kernelpatch在尝试读取superkey之前有一个检查cmd值的步骤，如果cmd值在范围内（SUPERCALL_HELLO和SUPERCALL_MAX之间）将会走向读取和验证superkey，反之会快速返回结束鉴权，这两种走向的花费时间是不同的，检测器可以提前拟定一个在范围内的cmd值和不在范围内的cmd值，分别向kernelpatch发起鉴权请求，同样的，多次测量范围内cmd和范围外cmd所花费的时间，取其总和来让比值趋于稳定，如果比值大于2，则判定kernelpatch存在。

懒分配：当用户态程序向操作系统请求分配页时，操作系统为了节省物理内存空间，会在虚拟内存分配该页，但不映射物理内存块，直到此页被真正访问后才会实质上分配内存块。