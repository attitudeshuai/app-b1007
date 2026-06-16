# AI 桌面助手

一个现代化的桌面应用程序,集成聊天对话、系统监控和设置管理功能。采用 Python 后端和 React 前端,完全容器化部署。

## 🛠 技术栈

- **Frontend**: React 19 + TypeScript + Vite + Ant Design 5
- **Backend**: Python 3.11 + FastAPI + SQLAlchemy
- **Database**: MySQL 8.0
- **Charts**: Recharts
- **Containerization**: Docker + Docker Compose

## ✨ 核心功能

### 1. 💬 聊天对话模块
- 实时消息发送与接收
- 消息历史记录持久化
- 时间戳显示
- 现代化气泡式对话界面
- 支持 Echo 响应(可扩展为 LLM API)

### 2. 📊 系统监控模块
- **CPU 使用率**: 实时监控处理器负载 取自docker数据
- **内存使用**: 显示总量、可用量和使用百分比 取自docker数据
- **网络流量**: 上传/下载流量统计 取自docker数据
- **GPU 状态**: 智能检测真实GPU数据(支持NVIDIA/AMD/Intel，Docker环境自动降级为模拟数据)
- **实时图表**: 动态折线图展示性能趋势

### 3. ⚙️ 设置模块
- 主题切换(深色/浅色)
- 通知设置(系统通知、消息通知、性能警告)
- 模型 API 配置
- API 密钥管理
- 设置持久化存储

## 🚀 启动指南

### 前置要求
- Docker Desktop 已安装并运行
- 端口 3007(前端)、8007(后端)、3306(数据库)未被占用

### 方式一: 一键启动(推荐)

```bash
# 赋予执行权限(首次运行)
chmod +x start.sh

# 启动应用(会自动打开浏览器)
./start.sh
```

**脚本功能**:
- ✅ 自动检查 Docker 是否运行
- ✅ 启动所有容器
- ✅ 等待服务就绪
- ✅ 自动在浏览器中打开应用
- ✅ 显示服务状态和访问地址

### 方式二: 手动启动

```bash
# 构建并启动所有容器
docker compose up --build

# 或者后台运行
docker compose up -d
```

### 停止服务

```bash
# 使用停止脚本
./stop.sh

# 或手动停止
docker compose down
```


### 启动流程
1. 数据库容器启动并初始化(约 5-10 秒)
2. 后端容器等待数据库健康检查通过后启动
3. 前端容器启动并提供服务

### 访问地址
- **前端应用**: http://localhost:3007
- **后端 API**: http://localhost:8007
- **API 文档**: http://localhost:8007/docs (FastAPI Swagger UI)
- **数据库**: localhost:33007 (用户: root / 密码: root)

## 🎨 界面特色

- **现代渐变设计**: 使用紫色系渐变和玻璃态效果
- **深色主题**: 默认深色模式,护眼舒适
- **响应式布局**: 适配桌面和移动端
- **流畅动画**: Hover 效果和过渡动画
- **中文界面**: 全中文用户界面

## 📁 项目结构

```
.
├── backend/                # Python 后端
│   ├── app/
│   │   ├── main.py        # FastAPI 入口
│   │   ├── database.py    # 数据库配置
│   │   ├── models/        # SQLAlchemy 模型
│   │   └── routers/       # API 路由
│   ├── db/
│   │   └── init.sql       # 数据库初始化脚本
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/              # React 前端
│   ├── src/
│   │   ├── components/    # 布局组件
│   │   ├── pages/         # 页面组件
│   │   └── services/      # API 服务
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
└── docker-compose.yml     # 容器编排配置
```

## 🧪 测试数据

系统启动时会自动填充演示数据:
- **聊天记录**: 包含欢迎消息和示例对话
- **系统设置**: 默认深色主题和 API 配置

## 🔧 开发说明

### 本地开发(不使用 Docker)

#### 后端
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8007
```

#### 前端
```bash
cd frontend
npm install
npm run dev
```

### 停止容器
```bash
docker compose down
```

### 查看日志
```bash
# 查看所有容器日志
docker compose logs

# 查看特定服务日志
docker compose logs backend
docker compose logs frontend
docker compose logs db
```

### 重新构建
```bash
docker compose up --build
```

## 🐛 常见问题

**Q: 前端无法连接后端?**  
A: 确保所有容器都已启动,可以通过 `docker compose ps` 查看状态

**Q: 数据库连接失败?**  
A: 等待数据库健康检查通过(约 5-10 秒),Docker Compose 会自动处理

**Q: 端口冲突?**  
A: 修改 `docker-compose.yml` 中的端口映射,例如将 `3007:80` 改为 `3008:80`

**Q: 如何清除所有数据?**  
A: 执行 `docker compose down -v` 会删除数据卷,下次启动将重新初始化

## 📝 API 文档

访问 http://localhost:8007/docs 查看完整的 API 文档(Swagger UI)

### 主要端点

- `GET /api/chat/` - 获取聊天历史
- `POST /api/chat/` - 发送消息
- `GET /api/monitor/stats` - 获取系统状态
- `GET /api/settings/` - 获取所有设置
- `POST /api/settings/` - 更新设置

## 🌟 技术亮点

1. **完全容器化**: 符合 Docker All-in-One 标准
2. **健康检查**: 数据库健康检查确保启动顺序
3. **UTF-8 支持**: 全链路 UTF-8 编码,无中文乱码
4. **ORM 管理**: 使用 SQLAlchemy ORM,避免 SQL 注入
5. **现代 UI**: Ant Design 5 + 自定义渐变样式
6. **实时监控**: 2 秒刷新的系统性能监控
7. **数据持久化**: Docker Volume 确保数据不丢失

## 📄 许可证

MIT License
