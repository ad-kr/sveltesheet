export function addAttributesToTags(
	code: string,
	componentInstanceIds: Map<string, string>
) {
	code = injectTagAttributes(code);
	code = injectComponentAttributes(code, componentInstanceIds);
	code = replaceTagCssTarget(code);
	code = replaceComponentCssTarget(code);
	return code;
}

function injectTagAttributes(code: string) {
	const lowercaseTagPattern = /<[a-z][^\/>\s]*(?=\s|>)/g;
	return code.replace(lowercaseTagPattern, (tag) => {
		if (tag === "<script" || tag === "<style") return tag;
		return `${tag} data-sveltesheet-ids={\`\${svelteCssRuntimeId}\`}`;
	});
}

function injectComponentAttributes(
	code: string,
	componentInstanceIds: Map<string, string>
) {
	const uppercaseTagPattern = /<[A-Z][^\/>\s]*(?=\s|>)/g;
	return code.replace(uppercaseTagPattern, (component) => {
		const componentName = component.substring(1);
		const componentInstanceId =
			componentInstanceIds.get(componentName) ?? "";
		return `${component} dataSveltesheetIds={\`${componentInstanceId} \${svelteCssRuntimeId}\`}`;
	});
}

const cssTargetPattern = /{\s*\.\.\.[^}]*cssTarget[^}]*}/g;

function replaceTagCssTarget(code: string) {
	const tagWithCssTargetPattern =
		/<[a-z][^>]*{\s*\.\.\.[^}]*cssTarget[^}]*}[^>]*>/g; // Matches whole tag that contains '{ ...cssTarget }';

	return code.replace(tagWithCssTargetPattern, (tag) => {
		return tag
			.replace(
				"data-sveltesheet-ids={`",
				"data-sveltesheet-ids={`${dataSveltesheetIds} "
			)
			.replace(cssTargetPattern, "");
	});
}

function replaceComponentCssTarget(code: string) {
	const componentWithCssTargetPattern =
		/<[A-Z][^>]*{\s*\.\.\.[^}]*cssTarget[^}]*}[^>]*>/g; // Matches whole tag that contains '{ ...cssTarget }';
	return code.replace(componentWithCssTargetPattern, (component) => {
		return component
			.replace(
				"dataSveltesheetIds={`",
				"dataSveltesheetIds={`${dataSveltesheetIds} "
			)
			.replace(cssTargetPattern, "");
	});
}
