from PIL import Image
img = Image.new('RGB', (100, 100), color = 'red')
img.save('sample_tomato.jpg')
print("Created sample_tomato.jpg")
