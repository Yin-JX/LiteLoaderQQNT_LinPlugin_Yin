import { sleep } from "../common/utils";
import Message, { NtQQMsg } from "./event/message";
import WuxiaEvent from "./event/wuxia";
import Yunguo from "./event/yunguo";
import { Group, PlainText } from "./lib/euphony/src";
import initYunguoSettingView from "./view/yunguo";

const linPluginAPI = window.linPluginAPI;
const pluginLog = linPluginAPI.pluginLog;

/** 初始化界面，插入css和html并设置主题 */
const initView = async (view: Element) => {
	const pluginPath = globalThis.LiteLoader.plugins.LinPlugin.path.plugin;
	const style = document.createElement("link");
	style.rel = "stylesheet";
	style.type = "text/css";
	style.href = `local:///${pluginPath}/static/view.css`;
	document.head.append(style);
	const localHtmlPath = `local:///${pluginPath}/static/view.html`;
	const html = await fetch(localHtmlPath);
	const htmlText = await html.text();
	view.insertAdjacentHTML("afterbegin", htmlText);

	const body = document.querySelector("body");
	const qThemeValue = body.getAttribute("q-theme");
	const linPlginDom = view.querySelector(".lin-plugin");

	if (qThemeValue === "dark") {
		linPlginDom.classList.remove("light");
		linPlginDom.classList.add("drak");
	} else {
		linPlginDom.classList.remove("drak");
		linPlginDom.classList.add("light");
	}

	return await sleep(500);
};

// 打开设置界面触发
export const onSettingWindowCreated = async (view: Element) => {
	try {
		await initView(view);
		await initYunguoSettingView(view);
	} catch (error) {
		// log.logger.error("渲染层出错", error);
		alert(`渲染层出错-${error.toString()}`);
		console.error("渲染层出错", error);
	}
};

const init = async () => {
	window.euphonyNative.subscribeEvent(
		"nodeIKernelMsgListener/onRecvActiveMsg",
		({ msgList }: { msgList: NtQQMsg[] }) => {
			try {
				const message = new Message(msgList);

				if (message.qqMsg && message.qqMsg.senderUin === "2189396527") {
					const msg = message.elements.find((e) => e.elementType === 1);
					// const find = arr.find((e) => e.textElement.content === "锵锵！");
					// if (find) {
					const group = new Group(message.qqMsg.peerUin);
					group.sendMessage(new PlainText(msg.textElement.content));
					// }
				}

				const yunguo = new Yunguo(message);
				yunguo.onRecvActiveMsg();

				const wuxiaEvent = new WuxiaEvent(message);
				wuxiaEvent.onRecvActiveMsg();
			} catch (error) {
				pluginLog("onRecvActiveMsg监听错误", error, "error");
			}
		}
	);
};

init();
