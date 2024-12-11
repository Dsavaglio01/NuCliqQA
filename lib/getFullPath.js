export function getFullPath(route, navigationRef) {
    console.log(route)
    switch (route) {
        case "PersonalChat":
            return navigationRef.current?.navigate('Themes', {screen: 'All'})
    
        default:
            return;
    }
}