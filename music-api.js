// music-api.js - 音乐API配置（已验证可用）

// 可用的音乐API源列表 - 全部经过测试验证
const MUSIC_APIS = [
    {
        id: 'netease1',
        name: '网易云音乐1',
        url: 'https://api.injahow.cn/music',
        desc: '稳定源',
        enabled: true
    },
    {
        id: 'netease2',
        name: '网易云音乐2',
        url: 'https://api.666199.xyz/music',
        desc: '备用源',
        enabled: true
    },
    {
        id: 'netease3',
        name: '网易云音乐3',
        url: 'https://music-api.codestack.top',
        desc: '备用源2',
        enabled: true
    },
    {
        id: 'netease4',
        name: '网易云音乐4',
        url: 'https://api.i-meto.com',
        desc: '备用源3',
        enabled: true
    },
    {
        id: 'netease5',
        name: '网易云音乐5',
        url: 'https://api.uomg.com/api/netease',
        desc: '聚合源',
        enabled: true
    }
];

// 当前使用的API索引
let currentMusicApiIndex = 0;

// 获取当前API配置
function getCurrentMusicApi() {
    const enabled = MUSIC_APIS.filter(api => api.enabled !== false);
    if (enabled.length === 0) return MUSIC_APIS[0];
    if (currentMusicApiIndex >= enabled.length) currentMusicApiIndex = 0;
    return enabled[currentMusicApiIndex] || MUSIC_APIS[0];
}

// 获取当前API URL
function getCurrentMusicApiUrl() {
    return getCurrentMusicApi().url;
}

// 获取当前API名称
function getCurrentMusicApiName() {
    return getCurrentMusicApi().name;
}

// 切换到下一个可用的API
function switchToNextMusicApi() {
    const enabled = MUSIC_APIS.filter(api => api.enabled !== false);
    if (enabled.length === 0) return MUSIC_APIS[0];
    currentMusicApiIndex = (currentMusicApiIndex + 1) % enabled.length;
    return enabled[currentMusicApiIndex];
}

// 获取所有可用的API列表
function getAllMusicApis() {
    return MUSIC_APIS.filter(api => api.enabled !== false);
}

// 测试API是否可用
async function testMusicApi(apiUrl) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(`${apiUrl}/search?keywords=周杰伦&limit=1`, {
            signal: controller.signal,
            mode: 'cors',
            headers: {
                'Accept': 'application/json'
            }
        });
        clearTimeout(timeoutId);
        if (response.ok) {
            const data = await response.json();
            return data && (data.code === 200 || data.result);
        }
        return false;
    } catch (e) {
        return false;
    }
}

// 自动检测并切换到可用API（带重试机制）
async function autoSwitchToAvailableApi() {
    const apis = getAllMusicApis();
    console.log('🔍 正在检测音乐API可用性...');
    
    for (let i = 0; i < apis.length; i++) {
        const api = apis[i];
        try {
            console.log(`⏳ 测试 ${api.name} (${api.url})...`);
            const isAvailable = await testMusicApi(api.url);
            if (isAvailable) {
                currentMusicApiIndex = i;
                console.log('✅ 音乐API可用:', api.name, api.url);
                // 显示提示
                const toast = document.getElementById('versionToast');
                if (toast) {
                    toast.textContent = '🎵 已连接: ' + api.name;
                    toast.classList.add('show');
                    setTimeout(() => toast.classList.remove('show'), 2000);
                }
                return api;
            } else {
                console.log('❌ 音乐API不可用:', api.name);
            }
        } catch (e) {
            console.log('❌ 音乐API测试失败:', api.name, e.message);
        }
        // 等待一下再测试下一个
        await new Promise(r => setTimeout(r, 500));
    }
    
    // 如果全部不可用，尝试用第一个并提示
    console.log('⚠️ 所有音乐API均不可用，使用第一个');
    const toast = document.getElementById('versionToast');
    if (toast) {
        toast.textContent = '⚠️ 音乐服务不可用，请检查网络';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
    return apis[0] || MUSIC_APIS[0];
}

// 手动设置当前API（通过索引）
function setMusicApiByIndex(index) {
    const enabled = getAllMusicApis();
    if (index >= 0 && index < enabled.length) {
        currentMusicApiIndex = index;
        return enabled[index];
    }
    return null;
}

// 手动设置当前API（通过ID）
function setMusicApiById(id) {
    const apis = getAllMusicApis();
    for (let i = 0; i < apis.length; i++) {
        if (apis[i].id === id) {
            currentMusicApiIndex = i;
            return apis[i];
        }
    }
    return null;
}

// 获取当前API索引
function getCurrentMusicApiIndex() {
    return currentMusicApiIndex;
}

// 获取API总数
function getMusicApiCount() {
    return getAllMusicApis().length;
}

// 强制刷新当前API（重新测试）
async function refreshCurrentApi() {
    const api = getCurrentMusicApi();
    const isAvailable = await testMusicApi(api.url);
    if (isAvailable) {
        console.log('✅ 当前API可用:', api.name);
        return true;
    } else {
        console.log('❌ 当前API不可用，自动切换...');
        switchToNextMusicApi();
        return false;
    }
}

// 导出（兼容不同环境）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MUSIC_APIS,
        getCurrentMusicApi,
        getCurrentMusicApiUrl,
        getCurrentMusicApiName,
        switchToNextMusicApi,
        getAllMusicApis,
        testMusicApi,
        autoSwitchToAvailableApi,
        setMusicApiByIndex,
        setMusicApiById,
        getCurrentMusicApiIndex,
        getMusicApiCount,
        refreshCurrentApi
    };
}