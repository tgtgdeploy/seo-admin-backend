#!/bin/bash

echo "========================================="
echo "  蜘蛛池9个域名完整测试"
echo "========================================="
echo ""

DOMAINS=(
    "autopushnetwork.xyz"
    "contentpoolzone.site"
    "crawlboostnet.xyz"
    "crawlenginepro.xyz"
    "linkpushmatrix.site"
    "rankspiderchain.xyz"
    "seohubnetwork.xyz"
    "spidertrackzone.xyz"
    "trafficboostflow.site"
)

VPS_MAP=(
    "VPS 1 - 95.111.231.110"
    "VPS 1 - 95.111.231.110"
    "VPS 1 - 95.111.231.110"
    "VPS 2 - 75.119.154.120"
    "VPS 2 - 75.119.154.120"
    "VPS 2 - 75.119.154.120"
    "VPS 3 - 37.60.254.52"
    "VPS 3 - 37.60.254.52"
    "VPS 3 - 37.60.254.52"
)

SUCCESS=0
FAILED=0

for i in "${!DOMAINS[@]}"; do
    domain="${DOMAINS[$i]}"
    vps="${VPS_MAP[$i]}"

    echo "[$((i+1))/9] 测试 $domain ($vps)"
    echo "----------------------------------------"

    # 测试HTTPS连接
    echo -n "  HTTPS连接 ... "
    if response=$(curl -sI --max-time 10 "https://$domain" 2>&1); then
        if echo "$response" | grep -q "HTTP"; then
            status=$(echo "$response" | grep "HTTP" | head -1)
            echo "✓ $status"
        else
            echo "✗ 无响应"
            ((FAILED++))
            echo ""
            continue
        fi
    else
        echo "✗ 连接失败"
        ((FAILED++))
        echo ""
        continue
    fi

    # 测试首页内容
    echo -n "  首页内容 ... "
    if curl -s --max-time 10 "https://$domain" | grep -q "<title>"; then
        echo "✓ 正常"
    else
        echo "✗ 无内容"
    fi

    # 测试Sitemap
    echo -n "  Sitemap ... "
    if curl -s --max-time 10 "https://$domain/sitemap.xml" | grep -q "urlset"; then
        echo "✓ 正常"
    else
        echo "✗ 异常"
    fi

    # 测试Robots
    echo -n "  Robots.txt ... "
    if curl -s --max-time 10 "https://$domain/robots.txt" | grep -q "Sitemap"; then
        echo "✓ 正常"
    else
        echo "✗ 异常"
    fi

    ((SUCCESS++))
    echo ""
done

echo "========================================="
echo "测试完成！"
echo "成功: $SUCCESS/9"
echo "失败: $FAILED/9"
echo "========================================="
