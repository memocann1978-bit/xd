module.exports = {
  apps: [
    { name: 'Moderation', namespace: 'MODLOFF', script: 'Global.Moderation.js', watch: false, exec_mode: 'fork', max_memory_restart: '2G', cwd: './Server/Moderation' },
    { name: 'Executive', namespace: 'MODLOFF', script: 'Global.Executive.js', watch: false, exec_mode: 'fork', max_memory_restart: '2G', cwd: './Server/Executive' },
    { name: 'Voucher', namespace: 'MODLOFF', script: 'Global.Voucher.js', watch: false, exec_mode: 'fork', max_memory_restart: '1G', cwd: './Server/Voucher' }
  ]
};
