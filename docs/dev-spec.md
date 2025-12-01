# 表格布局稳定性规范

## 规则

**所有 Table 列必须设置宽度约束，防止动态内容变化时列宽重新计算导致布局移动。**

## 实现要求

- TableHead 和 TableCell 使用相同的宽度约束类名
- 动态按钮使用 `min-w-[值]` 保持宽度一致

## 示例

```tsx
// ✅ 正确
<TableHead className="min-w-[200px] max-w-xs">Title</TableHead>
<TableHead className="w-[120px] whitespace-nowrap">Status</TableHead>
<TableHead className="w-[180px] whitespace-nowrap">Actions</TableHead>

<TableCell className="min-w-[200px] max-w-xs">...</TableCell>
<TableCell className="w-[120px] whitespace-nowrap">...</TableCell>
<TableCell className="w-[180px] whitespace-nowrap">...</TableCell>
```
