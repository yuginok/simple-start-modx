//Динамическое событие по элементу
function on(event, object, func = function () { }) {
	document.addEventListener(event, function (e) {
		const eTarget = e.target.closest(object);
		if (eTarget == null) return;
		func.call(eTarget, e);
	});
}

//Вызвает асинхронные скрипты
async function loadScript(src, func = false) {
	const script = document.createElement('script');
	script.src = src;
	document.body.append(script);
	if (func) script.onload = () => func();
}

// Работает с объектами input типа checkbox, содержащими data-form-confirm. Должен быть потомком элемента .form или form, который содержит submit элементы
function checkAgree() {
	const confirmElementDOM = 'input[data-form-confirm]',
		formDOM = 'form',
		parentFormElementDOM = '.form',
		queryElementDOM = '[type=submit]';
	for (let agree of document.querySelectorAll(confirmElementDOM)) changeAgree(agree);
	on('change', confirmElementDOM, function () { changeAgree(this); });
	function changeAgree(object) {
		const parent = object.closest(formDOM) ? object.closest(formDOM) : object.closest(parentFormElementDOM),
			submits = parent.querySelectorAll(queryElementDOM);
		if (!submits) return;
		for (let agree of parent.querySelectorAll(confirmElementDOM)) {
			for (let submit of submits) submit.disabled = false;
			if (!agree.checked) {
				for (let submit of submits) submit.disabled = true;
				break;
			}
		}
	}
}

//Ссылка по якорям
function clickAnchors() {
	on('click', 'a[href^="#"]', function (e) {
		e.preventDefault();
		const element = document.getElementById(this.getAttribute('href').substr(1));
		if (!element) return;
		element.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});
	});
}

//Обрабатывает контент модальных окон, которые передаются в парметре data-content.
function initModalPlaceholder(prefix = '.modal__') {
	on('click', '[data-fancybox][data-src*="#"]', function () {
		const dataContent = this.dataset.content,
			modalObject = document.getElementById(this.dataset.src.substr(1));
		if (!modalObject) return;
		let customContent = [];
		if (dataContent) {
			try { customContent = JSON.parse(`{${dataContent}}`); }
			catch (error) { }
		}
		for (let defaultElement of modalObject.querySelectorAll('[data-default]')) {
			let defaultValue = defaultElement.dataset.default;
			if (defaultElement.nodeName.toLowerCase() == 'input') defaultElement.value = defaultValue;
			else defaultElement.innerHTML = defaultValue;
		}
		for (let customItem in customContent) {
			let divDOM = modalObject.querySelector(prefix + customItem),
				inputDOM = modalObject.querySelector(`input[name="${customItem}"]`);
			if (divDOM) divDOM.innerHTML = customContent[customItem];
			if (inputDOM) inputDOM.value = customContent[customItem];
		}
	});
}

//Перемещает элемент при изменении размера экрана data-move - размер экрана, data-break - обратно, data-to - куда перемещать
function moveElements() {
	const preffix = 'movedIn';
	for (let moveElement of document.querySelectorAll('[data-move]')) {
		let data = moveElement.dataset,
			windowWidth = window.innerWidth,
			dataSize = (data.move) ? +data.move : 576,
			dataBreak = (data.break) ? +data.break : false,
			toElement = (data.to) ? document.getElementById(data.to) : false,
			oldPosition = document.getElementById(preffix + data.to);
		if (!toElement) return;
		if (windowWidth < dataSize && !oldPosition && windowWidth >= dataBreak) {
			let newOldPosition = document.createElement('div');
			newOldPosition.id = preffix + data.to;
			newOldPosition.style.display = 'none';
			moveElement.before(newOldPosition);
			toElement.append(moveElement);
		}
		else if ((windowWidth >= dataSize || (dataBreak && dataBreak > windowWidth)) && oldPosition) {
			if (!oldPosition) return;
			oldPosition.after(moveElement);
			oldPosition.remove();
		}
	}
}

function fixedHeader(headerId = 'mainHeader', fixedId = 'fixedHeader') {
	const header = document.getElementById(headerId);
	if (!header) return;
	const headerHeight = header.offsetHeight,
		offset = 50,
		scrollPosition = window.pageYOffset,
		fixedHeaderElement = document.getElementById(fixedId),
		fixedHeader = fixedHeaderElement ? fixedHeaderElement : header.cloneNode(true);
	fixedHeader.setAttribute('id', 'fixedHeader');
	fixedHeader.classList.add('fixed-header', 'mm-item');
	if (!fixedHeaderElement) document.body.prepend(fixedHeader);
	if (scrollPosition > headerHeight + offset) {
		setTimeout(() => fixedHeader.classList.add(ACTIVE_CLASS), 0);
	}
	else {
		if (!fixedHeader) return;
		fixedHeader.classList.remove(ACTIVE_CLASS);
	}
}

function pageUp() {
	const pageUpBtn = document.getElementById('pageup'),
		topShow = 280,
		scrollPosition = window.scrollY,
		documentFooter = document.querySelector('footer'),
		footerHeight = documentFooter ? documentFooter.offsetHeight : 0;
	if (!pageUpBtn) return;
	if (scrollPosition > topShow && scrollPosition < document.body.offsetHeight - window.innerHeight - footerHeight) pageUpBtn.classList.add(ACTIVE_CLASS);
	else pageUpBtn.classList.remove(ACTIVE_CLASS);
}

// Добавляет CSS стили для элмента в формате JSON
function css(element, css) {
	for (var style in css) {
		element.style[style] = css[style];
	}
}

// Клик вне блока 

function outsideClick(element, func) {
	element = (typeof (element) == 'string') ? document.querySelector(element) : element;

	document.addEventListener('click', (e) => {
		const withinBoundaries = e.composedPath().includes(element);
		if (!withinBoundaries) {
			func(element);
		}
	})
}

// Разварачивает и сварачивает объект
// Передаются объект, метод (по умолчанию NULL. Значения: down|up), скорость (по умолчанию 300)
function slideToggle(element, method = null, speed = 300,) {
	if (['right', 'left', 'backLeft', 'backRight'].includes(method)) {
		css(element, { 'transition': 'transform ' + speed + 'ms' });
		let parent = document.createElement('div');
		css(parent, { 'display': 'block', 'overflow': 'hidden' });
		element.before(parent);
		parent.append(element);
		if (element.offsetWidth == 0 && !['backLeft', 'backRight'].includes(method)) {
			css(element, { 'display': 'block', 'transform': 'translateX(' + ((method == 'left') ? '-100' : '100') + '%)' });
			css(parent, { 'width': element.offsetWidth + 'px' });
			setTimeout(() => element.style.transform = 'translateX(0)', 0);
			setTimeout(() => {
				parent.before(element);
				parent.remove();
				element.removeAttribute('style');
				element.style.display = 'block';
			}, speed);
		}
		else if (element.offsetWidth > 0 && /back/.test(method)) {
			element.style.transform = 'translateX(0)';
			css(parent, { 'width': element.offsetWidth + 'px' });
			setTimeout(() => element.style.transform = 'translateX(' + ((method == 'backLeft') ? '-100' : '100') + '%)', 0);
			setTimeout(() => {
				parent.before(element);
				parent.remove();
				element.removeAttribute('style');
				element.style.display = 'none';
			}, speed);
		}
	}
	else {
		css(element, { 'transition': 'height ' + speed + 'ms', 'overflow': 'hidden' });
		let height = element.clientHeight + 'px';
		if (element.offsetHeight == 0 && method != 'up') {
			css(element, { 'display': 'block', 'height': 'auto' });
			height = element.clientHeight + 'px';
			element.style.height = '0px';
			setTimeout(() => element.style.height = height, 0);
			setTimeout(() => {
				element.removeAttribute('style');
				element.style.display = 'block';
			}, speed);
		}
		else if (element.offsetHeight > 0 && method != 'down') {
			height = element.clientHeight + 'px';
			element.style.height = height;
			setTimeout(() => element.style.height = '0px', 0);
			setTimeout(() => {
				element.removeAttribute('style');
				element.style.display = 'none';
			}, speed);
		}
	}
}
// Показывает скрывает объект
// Передаются объект, скорость (по умолчанию 300), метод (по умолчанию NULL. Значения: 'show')
function fadeToggle(element, method = null, speed = 300) {
	if (element.offsetHeight == 0 && method != 'hide') {
		css(element, { 'transition': 'opacity ' + speed + 'ms', 'display': 'block', 'opacity': 0 });
		setTimeout(() => element.style.opacity = 1, 0);
		setTimeout(() => {
			element.removeAttribute('style');
			element.style.display = 'block';
		}, speed);
	}
	else if (element.offsetHeight != 0 && method != 'show') {
		css(element, { 'transition': 'opacity ' + speed + 'ms' });
		setTimeout(() => element.style.opacity = 0, 0);
		setTimeout(() => {
			element.removeAttribute('style');
			element.style.display = 'none';
		}, speed);
	}
}


const INPUT_INIT = 'input-initialized';
const INPUT_IGNORE = 'input-ignore';
function setPhonesMask() {
	for (let phone of document.querySelectorAll(`input[type="tel"]:not(.${INPUT_INIT}):not(.${INPUT_IGNORE})`)) {
		phone.addEventListener('keydown', function (e) {
			if (e.key == undefined) return;
			if (['Delete', 'Backspace', 'Enter'].includes(e.key) || e.key.match(/^arrow/i)) return;
			if (!e.altKey && !e.ctrlKey && !e.shiftKey && e.key.match(/\D/)) e.preventDefault();
		});
		phone.addEventListener('paste', function () {
			this.dispatchEvent(new Event('input'));
		});
		phone.addEventListener('input', function (e) {
			let value = this.value.replace(/\D/ig, '').substr(0, 13);
			if (value[0] == '9') value = `7${value}`;
			let rusFormat = [7, 8, 9].includes(+value[0]),
				result = '',
				startPosition = ((e.inputType && e.inputType.match(/^deleteContent/)) || (this.selectionStart < this.value.length)) ? this.selectionStart : false;
			for (let idx in value) {
				idx = +idx;
				let num = value[idx];
				if (idx == 0) {
					if (num == 8) result += '8';
					else if (num == 9) result += '+7 (9';
					else result += `+${num}`;
				}
				else {
					if (rusFormat) {
						if (idx == 1) result += ` (${num}`;
						else if ([2, 3, 5, 6, 8, 10].includes(idx)) result += `${num}`;
						else if ([7, 9].includes(idx)) result += `-${num}`;
						else if (idx == 4) result += `) ${num}`;
					}
					else result += `${num}`;
				}
			}
			this.value = result;
			if (startPosition && value.length < 11 && rusFormat) {
				this.selectionStart = startPosition;
				this.selectionEnd = startPosition;
			}
		});
		phone.classList.add(INPUT_INIT);
	}
}

function setCustomSelect() {
	const mainClass = 'selector',
		selectedClass = 'is-selected',
		activeClass = ACTIVE_CLASS,
		reverseClass = 'is-reverse',
		disabledClass = 'is-disabled',
		optionClass = 'option',
		separator = '__',
		modSeparator = '_',
		mobileClass = 'mobile',
		elements = ['label', 'title', 'btn', 'list'];
	for (let select of document.querySelectorAll(`select:not(.${INPUT_INIT}):not(.${INPUT_IGNORE})`)) {
		let main = document.createElement('div');
		main.classList.add(mainClass);
		if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) main.classList.add(`${mainClass}${modSeparator}${mobileClass}`);
		for (let element of elements) {
			eval(`var ${element} = document.createElement('div')`);
			eval(element).classList.add(`${mainClass}${separator}${element}`);
		}
		select.after(main);
		label.append(title, btn);
		main.append(select, label, list);
		label.addEventListener('click', function (e) {
			let parent = this.parentNode,
				list = parent.querySelector(`.${mainClass}${separator}${elements[3]}`);
			if (window.innerHeight - list.getBoundingClientRect().top - parent.offsetHeight < list.offsetHeight) parent.classList.add(reverseClass);
			else parent.classList.remove(reverseClass);
			parent.classList.toggle(activeClass);
		});
		outsieClick(main, (element) => element.classList.remove(activeClass));
		setSelectList(select);
		select.addEventListener('change', () => setSelectList(select));
		select.classList.add(INPUT_INIT);
		function setSelectList(select) {
			let parent = select.closest(`.${mainClass}`),
				list = parent.querySelector(`.${mainClass}${separator}${elements[3]}`),
				title = parent.querySelector(`.${mainClass}${separator}${elements[1]}`);
			list.innerHTML = '';
			for (let option of select.options) {
				let optionDOM = document.createElement('div'),
					optionDOMClassList = optionDOM.classList;
				optionDOM.textContent = option.textContent;
				optionDOM.dataset.value = option.value;
				optionDOMClassList.add(`${mainClass}${separator}${optionClass}`);
				if (option.selected) {
					optionDOMClassList.add(selectedClass);
					title.textContent = option.textContent;
					if (option.disabled) title.classList.add(disabledClass);
					else title.classList.remove(disabledClass);
				}
				if (option.disabled) optionDOMClassList.add(disabledClass);
				list.append(optionDOM);
				optionDOM.addEventListener('click', function (e) {
					if (this.classList.contains(disabledClass)) return;
					this.closest(`.${mainClass}`).classList.remove(activeClass);
					select.value = this.dataset.value;
					select.dispatchEvent(new Event('change'))
				});
			}
		}
	}
}

function getCookie(key = false) {
	let cookies = [];
	for (let cookie of document.cookie.split(';')) {
		cookie = cookie.split('=');
		cookies[decodeURIComponent(cookie[0]).trim()] = decodeURIComponent(cookie[1]);
	}
	return (!key) ? cookies : cookies[key];
}

function setCookie(name, value, options = {}) {
	if (!options.path) options.path = '/';
	if (!options.samesite) options.samesite = 'lax';
	console.log(options);
	if (options.expires instanceof Date) {
		options.expires = options.expires.toUTCString();
	}
	let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
	for (let optionKey in options) {
		updatedCookie += "; " + optionKey;
		let optionValue = options[optionKey];
		if (optionValue !== true) {
			updatedCookie += "=" + optionValue;
		}
	}
	document.cookie = updatedCookie;
}

function deleteCookie(name) {
	setCookie(name, "", {
		'max-age': -1
	});
}

// 1 - функция до 2 - функция после 3 - элементы с изменяющимся контентом 4- массив с элементами и атрибутами
function fastLoadPage(functionBefore = function () { }, functionSuccess = function () { }, changeElementsContent = [], cahngeAttributes = []) {
	const pageLoadClass = 'page-is-loading',
		pageLoader = document.createElement('div');
	pageLoader.classList.add('page-loader');
	document.body.append(pageLoader);
	cahngeAttributes = [
		{
			element: 'meta[name=description]',
			attribute: 'content'
		},
		{
			element: 'meta[name=keywords]',
			attribute: 'content'
		},
		{
			element: 'meta[property="og:title"]',
			attribute: 'content'
		},
		{
			element: 'meta[property="og:description"]',
			attribute: 'content'
		},
		{
			element: 'meta[property="og:image"]',
			attribute: 'content'
		},
		{
			element: 'input[name=page]',
			attribute: 'value'
		}
	].concat(cahngeAttributes);

	changeElementsContent = ['#main', '#breadcrumbs'].concat(changeElementsContent);

	onpopstate = (e) => loadPage(e.target.location.href, false);

	on('click', 'a[href]', function (e) {
		if (e.ctrlKey === true) return;
		const href = this.getAttribute('href').split('?')[0];
		if (this.target || !href || href.match(/^\/?(#|mailto:|tel:|javascript;|http|https|ftp)/i) || (href.match(/\.\w+$/i) && !href.match(/\.(html|htm|php)$/i))) return;
		e.preventDefault();
		loadPage(this.href);
	});

	function loadPage(href, writeHistory = true) {
		try {
			const pageIsLoading = document.createElement('div');
			css(pageIsLoading, { position: 'fixed', inset: '0', zIndex: '9999999' });
			document.body.append(pageIsLoading);
			document.body.classList.add(pageLoadClass);
			functionBefore.call(this);
			fetch(href)
				.then(response => response.text())
				.then(newContent => {
					const newDocumentElement = document.createElement('html');
					newDocumentElement.innerHTML = newContent;
					const newDOM = document.implementation.createHTMLDocument();
					newDOM.head.innerHTML = newDocumentElement.querySelector('head').innerHTML;
					newDOM.body.innerHTML = newDocumentElement.querySelector('body').innerHTML;
					for (let item of cahngeAttributes) {
						for (let oldElement of document.querySelectorAll(item.element)) {
							let newElement = newDOM.querySelector(item.element);
							if (!newElement) continue;
							oldElement.setAttribute(item.attribute, newElement.getAttribute(item.attribute));
						}
					}
					changedContent = false;
					for (let item of changeElementsContent) {
						let oldElement = document.querySelector(item),
							newElement = newDOM.querySelector(item);
						if (!oldElement || !newElement) continue;
						oldElement.innerHTML = newElement.innerHTML;
						changedContent = true;
					}
					if (!changedContent) {
						window.location.href = href;
						return;
					}
					if (writeHistory) {
						window.history.replaceState(null, document.title, window.location.href)
						window.history.pushState(null, newDOM.title, href);
					}
					document.title = newDOM.title;
					globalFunctions();
					functionSuccess.call(this, newDOM);
					pageIsLoading.remove();
					document.body.classList.remove(pageLoadClass);
				});
		} catch (error) {
			window.location.href = href;
		}
	}
}

function isMobile() {
	return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) ? true : false;
}

function initViberLink() {
	if (!isMobile()) return;
	const viberLink = document.querySelector('a[href^="viber://"]');
	if (viberLink) {
		const url = new URL(viberLink.href),
			number = url.searchParams.get('number').replace(/\D/, '');
		if (number) viberLink.href = `viber://add?number=${number}`;
	}
}

function createStructure(element) {
	const type = element.type ? element.type : "div",
		classes = element.classes,
		children = element.children,
		content = element.content,
		inner = element.inner,
		data = element.data,
		variable = element.variable,
		newElement = document.createElement(type);
	if (classes) {
		if (typeof classes == "string") newElement.setAttribute("class", classes.trim());
		else classes.forEach(cls => newElement.classList.add(cls));
	}
	if (content) newElement.textContent = content;
	if (inner) newElement.innerHTML = inner;
	if (data) for (var dataElement in data) newElement.dataset[dataElement] = data[dataElement];
	if (children) children.forEach(child => newElement.append(createStructure(child)));
	if (variable) window[variable] = newElement;
	return newElement;
}