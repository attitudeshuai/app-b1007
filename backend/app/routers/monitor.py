from fastapi import APIRouter
import psutil
import time

router = APIRouter()

def get_gpu_info():
    """
    智能GPU检测，支持多种GPU类型
    优先级: GPUtil(NVIDIA) > py3nvml > 模拟数据
    适用于跨平台桌面应用，在Docker环境中自动降级
    """
    # 尝试 GPUtil (NVIDIA GPU)
    try:
        import GPUtil
        gpus = GPUtil.getGPUs()
        if gpus and len(gpus) > 0:
            gpu = gpus[0]
            return {
                "name": gpu.name,
                "load": round(gpu.load * 100, 1),
                "memory_used": round(gpu.memoryUsed, 1),
                "memory_total": round(gpu.memoryTotal, 1)
            }
    except Exception:
        pass
    
    # 尝试 py3nvml (通用NVML接口)
    try:
        import pynvml
        pynvml.nvmlInit()
        handle = pynvml.nvmlDeviceGetHandleByIndex(0)
        name = pynvml.nvmlDeviceGetName(handle)
        if isinstance(name, bytes):
            name = name.decode('utf-8')
        util = pynvml.nvmlDeviceGetUtilizationRates(handle)
        mem = pynvml.nvmlDeviceGetMemoryInfo(handle)
        pynvml.nvmlShutdown()
        return {
            "name": name,
            "load": float(util.gpu),
            "memory_used": round(mem.used / (1024**2), 1),
            "memory_total": round(mem.total / (1024**2), 1)
        }
    except Exception:
        pass
    
    # 回退到模拟数据（Docker环境或无GPU）
    return {
        "name": "未检测到GPU (Docker环境)",
        "load": 0,
        "memory_used": 0,
        "memory_total": 0
    }

@router.get("/stats")
def get_system_stats():
    # CPU
    cpu_percent = psutil.cpu_percent(interval=None)
    
    # Memory
    mem = psutil.virtual_memory()
    
    # Network
    net_io = psutil.net_io_counters()
    
    # GPU - 智能检测，支持真实桌面环境
    gpu_info = get_gpu_info()
    
    return {
        "cpu": {
            "percent": cpu_percent,
            "count": psutil.cpu_count()
        },
        "memory": {
            "total": mem.total,
            "available": mem.available,
            "percent": mem.percent
        },
        "network": {
            "bytes_sent": net_io.bytes_sent,
            "bytes_recv": net_io.bytes_recv
        },
        "gpu": gpu_info
    }
