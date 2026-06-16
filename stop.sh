#!/bin/bash

# AI 桌面助手 - 停止脚本

echo "🛑 停止 AI 桌面助手..."
echo ""

docker compose down

echo ""
echo "✅ 所有服务已停止"
echo ""
echo "💡 提示:"
echo "   - 重新启动: ./start.sh"
echo "   - 删除数据: docker compose down -v"
echo ""
