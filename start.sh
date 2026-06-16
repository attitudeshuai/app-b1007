#!/bin/bash

# AI 桌面助手 - 一键启动脚本 (Electron 版本)
# 功能: 启动 Docker 容器并在 Electron 桌面应用中打开

set -e

echo "🚀 AI 桌面助手 - 启动中..."
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行,请先启动 Docker Desktop"
    exit 1
fi

echo "✅ Docker 正在运行"
echo ""

# 询问启动方式
echo "请选择启动方式:"
echo "  1) Electron 桌面应用 (推荐)"
echo "  2) 浏览器访问"
echo ""
read -p "请输入选择 (1/2): " -n 1 -r
echo ""
echo ""

if [[ $REPLY =~ ^[1]$ ]]; then
    # Electron 模式
    echo "🖥️  启动 Electron 桌面应用..."
    echo ""
    
    # 检查 Electron 依赖是否已安装
    if [ ! -d "desktop/node_modules" ]; then
        echo "📦 首次运行,安装 Electron 依赖..."
        cd desktop && npm install && cd ..
        echo ""
    fi
    
    # 启动 Electron (它会自动启动 Docker)
    echo "✨ 正在启动桌面应用..."
    cd desktop && npm start
    
else
    # 浏览器模式
    echo "🌐 启动浏览器模式..."
    echo ""
    
    # 检查容器是否已经在运行
    if docker compose ps | grep -q "Up"; then
        echo "📦 检测到容器已在运行"
        read -p "是否重启容器? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "🔄 重启容器中..."
            docker compose down
            docker compose up -d
        fi
    else
        echo "🔨 启动 Docker 容器..."
        docker compose up -d
    fi

    echo ""
    echo "⏳ 等待服务启动..."

    # 等待后端服务就绪
    MAX_RETRIES=30
    RETRY_COUNT=0

    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -s http://localhost:8007/ > /dev/null 2>&1; then
            echo "✅ 后端服务已就绪"
            break
        fi
        RETRY_COUNT=$((RETRY_COUNT + 1))
        echo -n "."
        sleep 1
    done

    if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
        echo ""
        echo "⚠️  后端服务启动超时,请检查日志: docker compose logs backend"
        exit 1
    fi

    echo ""
    echo "✅ 所有服务已启动成功!"
    echo ""
    echo "📊 服务状态:"
    docker compose ps
    echo ""
    echo "🌐 访问地址:"
    echo "   前端应用: http://localhost:3007"
    echo "   后端 API: http://localhost:8007"
    echo "   API 文档: http://localhost:8007/docs"
    echo ""

    # 在浏览器中打开应用
    echo "🌟 正在打开浏览器..."
    sleep 2

    # 根据操作系统打开浏览器
    if [[ "$OSTYPE" == "darwin"* ]]; then
        open http://localhost:3007
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        xdg-open http://localhost:3007 2>/dev/null || echo "请手动访问: http://localhost:3007"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        start http://localhost:3007
    else
        echo "请手动在浏览器中访问: http://localhost:3007"
    fi

    echo ""
    echo "✨ 启动完成! 享受使用 AI 桌面助手吧!"
    echo ""
    echo "💡 提示:"
    echo "   - 查看日志: docker compose logs -f"
    echo "   - 停止服务: docker compose down"
    echo "   - 重启服务: docker compose restart"
    echo ""
fi
