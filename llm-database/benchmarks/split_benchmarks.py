"""
将arena_elo CSV文件按benchmark拆分成多个文件
"""

import pandas as pd
import os

# 读取原始CSV
input_file = 'lmwiki/llm-database/benchmarks/arena_elo_20260102_185814.csv'
output_dir = 'lmwiki/llm-database/benchmarks'

df = pd.read_csv(input_file)

# benchmark列（排除非benchmark列）
non_benchmark_cols = ['Rank', 'Model', 'Organization', 'License']
benchmark_cols = [col for col in df.columns if col not in non_benchmark_cols]

print(f"找到 {len(benchmark_cols)} 个benchmark列: {benchmark_cols}")

# 为每个benchmark创建单独的CSV
for benchmark in benchmark_cols:
    # 只保留Model和该benchmark列
    subset = df[['Model', benchmark]].copy()
    
    # 过滤掉空值
    subset = subset[subset[benchmark].notna() & (subset[benchmark] != '')]
    
    if len(subset) > 0:
        # 文件名使用benchmark名称（替换特殊字符）
        safe_name = benchmark.replace(' ', '_').replace('-', '_')
        output_file = os.path.join(output_dir, f'{safe_name}.csv')
        
        subset.to_csv(output_file, index=False)
        print(f"✓ {output_file} ({len(subset)} 条记录)")

print("\n拆分完成!")
