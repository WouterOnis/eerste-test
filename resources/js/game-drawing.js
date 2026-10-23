// Shared lighting keeps the arcade games consistent without changing hitboxes.
export function gradient(context, x, y, width, height, color) {
    const fill = context.createLinearGradient(x, y, x + width, y + height);
    fill.addColorStop(0, color);
    fill.addColorStop(1, '#152030');
    return fill;
}

export function raised(context, x, y, width, height, radius, color) {
    context.save();
    context.shadowColor = '#00000080';
    context.shadowBlur = 5;
    context.shadowOffsetY = 3;
    context.fillStyle = gradient(context, x, y, 0, height * 2, color);
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
    context.fill();
    context.shadowColor = 'transparent';
    context.lineWidth = 1;
    context.strokeStyle = '#ffffff45';
    context.stroke();
    context.beginPath();
    context.moveTo(x + 4, y + 3);
    context.lineTo(x + width - 4, y + 3);
    context.stroke();
    context.restore();
}

export function sphere(context, x, y, radius, color) {
    context.save();
    const fill = context.createRadialGradient(x - radius * 0.35, y - radius * 0.4, 0, x, y, radius);
    fill.addColorStop(0, '#fff9e8');
    fill.addColorStop(0.3, color);
    fill.addColorStop(1, '#233044');
    context.fillStyle = fill;
    context.shadowColor = '#00000088';
    context.shadowBlur = 5;
    context.shadowOffsetY = 3;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fill();
    context.restore();
}

export function backdrop(context, width, height, color) {
    context.fillStyle = gradient(context, 0, 0, width, height, color);
    context.fillRect(0, 0, width, height);
}
