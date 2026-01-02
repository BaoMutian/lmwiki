"""
爬取 OpenLM Chatbot Arena ELO 榜单数据
"""

import requests
from bs4 import BeautifulSoup
import json
import pandas as pd
from datetime import datetime

def crawl_arena_elo():
    url = "https://openlm.ai/chatbot-arena/"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }
    
    print(f"正在爬取: {url}")
    response = requests.get(url, headers=headers, timeout=30)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # 找到表格
    table = soup.find('table')
    if not table:
        print("未找到表格")
        return None
    
    # 解析表头
    headers_row = table.find('tr')
    headers_cells = headers_row.find_all(['th', 'td'])
    columns = [cell.get_text(strip=True) for cell in headers_cells]
    print(f"表头: {columns}")
    
    # 解析数据行
    rows = table.find_all('tr')[1:]  # 跳过表头
    data = []
    
    for row in rows:
        cells = row.find_all(['td', 'th'])
        row_data = [cell.get_text(strip=True) for cell in cells]
        if len(row_data) >= len(columns):
            data.append(row_data[:len(columns)])
    
    # 创建DataFrame
    df = pd.DataFrame(data, columns=columns)
    
    # 清理第一列（奖杯emoji列）
    if df.columns[0] == '':
        df = df.rename(columns={'': 'Rank'})
    
    print(f"\n成功爬取 {len(df)} 条记录")
    print("\n前10名模型:")
    print(df.head(10).to_string(index=False))
    
    # 保存为CSV
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    csv_file = f'arena_elo_{timestamp}.csv'
    df.to_csv(csv_file, index=False, encoding='utf-8-sig')
    print(f"\n数据已保存到: {csv_file}")
    
    # 保存为JSON
    json_file = f'arena_elo_{timestamp}.json'
    df.to_json(json_file, orient='records', force_ascii=False, indent=2)
    print(f"数据已保存到: {json_file}")
    
    return df

if __name__ == "__main__":
    df = crawl_arena_elo()
    
    if df is not None:
        print(f"\n\n========== 完整榜单 ({len(df)} 个模型) ==========\n")
        print(df.to_string(index=False))
