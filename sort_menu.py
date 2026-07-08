import locale
from bs4 import BeautifulSoup

# Try to set Vietnamese locale, fallback to C
try:
    locale.setlocale(locale.LC_COLLATE, 'vi_VN.UTF-8')
except locale.Error:
    locale.setlocale(locale.LC_COLLATE, '')

with open('/Users/trungngo/.gemini/antigravity-ide/scratch/dttm-hue-clone/index.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

nav_list = soup.find('ul', class_='nav-list')
if nav_list:
    dropdowns = nav_list.find_all('ul', class_='dropdown')
    for dropdown in dropdowns:
        lis = dropdown.find_all('li', recursive=False)
        
        # Sort lis based on the text of their 'a' tag
        # Handle cases where there might be submenu (like "Văn bản dự thảo Trung tâm IOC")
        def get_text(li):
            a_tag = li.find('a')
            return a_tag.get_text(strip=True) if a_tag else li.get_text(strip=True)
            
        sorted_lis = sorted(lis, key=lambda li: locale.strxfrm(get_text(li)))
        
        # Clear the dropdown and append sorted lis
        dropdown.clear()
        dropdown.append("\n                                ")
        for i, li in enumerate(sorted_lis):
            dropdown.append(li)
            if i < len(sorted_lis) - 1:
                dropdown.append("\n                                ")
            else:
                dropdown.append("\n                            ")

with open('/Users/trungngo/.gemini/antigravity-ide/scratch/dttm-hue-clone/index_sorted.html', 'w', encoding='utf-8') as f:
    f.write(str(soup))
print("Sorted HTML written to index_sorted.html")
