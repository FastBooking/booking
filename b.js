let urlBookingCode = '';
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('預約碼')) {
    urlBookingCode = urlParams.get('預約碼');
    console.log('URL 預約碼:', urlBookingCode);
}

window.addEventListener('DOMContentLoaded', function() {
    urlParams.forEach((value, key) => {
    if (key === '預約碼') return;
    
    const input = document.querySelector(`[name="${key}"]`);
    if (input) {
        input.value = decodeURIComponent(value);
        
        if (key === '分店') {
        input.dispatchEvent(new Event('change'));
        }
    }
    });
    

    if (urlBookingCode) {
    const submitButton = document.querySelector('.submit-btn');
    submitButton.textContent = '送出變更';
    }
});




const branchData = {
    '忠孝': {
    consultants: ['小美', 'Amy', '珊珊'],
    doctors: ['王建民', '李雅婷', '陳志豪']
    },
    '板橋': {
    consultants: ['Jenny', '小琪', 'Sunny'],
    doctors: ['林淑芬', '張家豪', '劉美珍']
    },
    '桃園': {
    consultants: ['欣欣', 'Tina', '小柔'],
    doctors: ['黃志明', '吳佳穎', '鄭宇軒']
    },
    '新竹': {
    consultants: ['Emily', '娜娜', '小涵'],
    doctors: ['蔡雨涵', '許文華', '楊世傑']
    },
    '台中': {
    consultants: ['小敏', 'Vivian', '莉莉'],
    doctors: ['謝明哲', '何欣怡', '賴俊宏']
    },
    '台南1': {
    consultants: ['Cindy', '小萱', 'Karen'],
    doctors: ['胡雅玲', '周俊賢', '蘇佩君']
    },
    '台南2': {
    consultants: ['妮妮', 'Angela', '雅雅'],
    doctors: ['范子文', '曾麗華', '高志偉']
    },
    '中正': {
    consultants: ['Sophie', '小華', 'Mia'],
    doctors: ['邱淑娟', '魏嘉琪', '羅文彬']
    }
};


function updateDropdown(selectId, options, placeholder) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">' + placeholder + '</option>';
    options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt;
    option.textContent = opt;
    select.appendChild(option);
    });
}


document.getElementById('branch').addEventListener('change', function() {
    const branch = this.value;
    if (branch && branchData[branch]) {
    updateDropdown('consultant', branchData[branch].consultants, '請選擇諮詢師');
    updateDropdown('doctor', branchData[branch].doctors, '請選擇醫師');
    } else {
    document.getElementById('consultant').innerHTML = '<option value="">請先選擇分店</option>';
    document.getElementById('doctor').innerHTML = '<option value="">請先選擇分店</option>';
    }
});


document.getElementById('service').addEventListener('change', function() {
    const service = this.value;
    const doctorSelect = document.getElementById('doctor');
    
    if (service === '諮詢') {

    doctorSelect.value = '';
    doctorSelect.disabled = true;
    doctorSelect.required = false;
    doctorSelect.style.backgroundColor = '#f0f0f0';
    doctorSelect.style.cursor = 'not-allowed';
    } else {

    doctorSelect.disabled = false;
    doctorSelect.required = true;
    doctorSelect.style.backgroundColor = '';
    doctorSelect.style.cursor = 'pointer';
    
    const branch = document.getElementById('branch').value;
    if (branch && branchData[branch]) {
        updateDropdown('doctor', branchData[branch].doctors, '請選擇醫師')
    } else {
        doctorSelect.innerHTML = '<option value="">請先選擇分店</option>'
    }
    }
});

document.getElementById('bookingForm').addEventListener('submit', async function(e) {
    e.preventDefault();


    const service = document.getElementById('service').value;
    const doctorSelect = document.getElementById('doctor');
    
    if (service !== '諮詢' && !doctorSelect.value) {
    const responseDiv = document.getElementById('response');
    responseDiv.className = 'response-message error';
    responseDiv.textContent = '請選擇醫師';
    responseDiv.style.display = 'block';
    return;  
    }
    
    const submitButton = e.target.querySelector('button[type="submit"]');
    
    submitButton.disabled = true;
    submitButton.textContent = '處理中...';

    const recaptchaToken = await grecaptcha.execute('6LegcUEsAAAAAJeTDvIPSziY4RRM91OPJ83LmlJo', {action: 'submit'});
    
    const formData = new FormData(e.target);
    const data = {};
    formData.forEach((value, key) => {
    data[key] = value;
    });
    
    data.recaptchaToken = recaptchaToken;

    if (urlBookingCode) {
    data.預約碼 = urlBookingCode;
    console.log('送出資料包含預約碼:', urlBookingCode);
    }
    
    const responseDiv = document.getElementById('response');
    responseDiv.style.display = 'none';
    
    try {
    const response = await fetch('https://hm6626.app.n8n.cloud/webhook-test/booking', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    responseDiv.className = response.ok ? 'success' : 'error';
    responseDiv.textContent = result.message || result;
    responseDiv.style.display = 'block';
    
    if (response.ok) {

        if (result.message?.includes('預約成功')) {
        e.target.reset();
        }
    }
    } catch (error) {
    console.log('Request failed:', error);
    } finally {
    setTimeout(() => {
        submitButton.disabled = false;

        submitButton.textContent = urlBookingCode ? '送出變更' : '送出預約';
    }, 2000);
    }
});
